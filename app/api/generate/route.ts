import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

export const runtime = "nodejs"

const RequestSchema = z.object({
  postText: z.string().min(1).max(5000),
  vibe: z.enum(["diplomatic", "direct", "playful", "nerdy", "contrarian"]).optional(),
  risk: z.enum(["safe", "medium", "bold"]).optional(),
  length: z.enum(["one-liner", "two-three", "paragraph"]).optional(),
  cta: z.enum(["none", "question", "invite", "resource"]).optional(),
  persona: z.enum(["builder", "designer", "pm", "founder", "recruiter"]).optional(),
  noCringe: z.boolean().optional(),
})

const ReplySchema = z.object({
  category: z.enum(["SAFE", "INTERESTING", "BOLD"]).optional(),
  text: z.string().min(1),
  tags: z.array(z.string()).optional(),
  lengthLabel: z.string().optional(),
  score: z.number().optional(),
})

const ResponseSchema = z.object({
  replies: z.array(ReplySchema).min(1),
})

type ReplyCategory = "SAFE" | "INTERESTING" | "BOLD"

const defaults = {
  vibe: "diplomatic",
  risk: "medium",
  length: "two-three",
  cta: "none",
  persona: "builder",
  noCringe: true,
} as const

function deriveLengthLabel(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words <= 12) return "short"
  if (words <= 35) return "medium"
  return "long"
}

function normalizeCategory(
  value: ReplyCategory | undefined,
  fallback: ReplyCategory
): ReplyCategory {
  if (value === "SAFE" || value === "INTERESTING" || value === "BOLD") {
    return value
  }
  return fallback
}

function ensureTagCount(tags: string[] | undefined) {
  if (!tags || tags.length === 0) return ["specific", "tone-fit"]
  if (tags.length === 1) return [tags[0], "value-add"]
  return tags.slice(0, 3)
}

function reorderReplies(replies: ReplySchema[], fallback: ReplyCategory) {
  const normalized = replies.map((reply, index) => ({
    ...reply,
    category: normalizeCategory(reply.category, fallback),
    text: reply.text.trim(),
    tags: ensureTagCount(reply.tags),
    lengthLabel: reply.lengthLabel || deriveLengthLabel(reply.text),
    score: reply.score ?? Math.max(0.1, 1 - index * 0.04),
  }))

  const buckets: Record<ReplyCategory, typeof normalized> = {
    SAFE: [],
    INTERESTING: [],
    BOLD: [],
  }

  normalized.forEach((reply) => buckets[reply.category].push(reply))

  const pick = (category: ReplyCategory, count: number) => {
    const selected = buckets[category].splice(0, count)
    return selected
  }

  const safe = pick("SAFE", 3)
  const interesting = pick("INTERESTING", 5)
  const bold = pick("BOLD", 2)

  const leftovers = [...buckets.SAFE, ...buckets.INTERESTING, ...buckets.BOLD]

  const fill = (arr: typeof safe, count: number) => {
    while (arr.length < count && leftovers.length) {
      arr.push(leftovers.shift()!)
    }
  }

  fill(safe, 3)
  fill(interesting, 5)
  fill(bold, 2)

  const combined = [...safe, ...interesting, ...bold, ...leftovers]
  return combined.slice(0, 20)
}

function buildPrompt(settings: typeof defaults & { postText: string }) {
  const ctaHints: Record<typeof defaults.cta, string> = {
    none: "No CTA.",
    question: "End with a light question when possible.",
    invite: "Invite a response without sounding salesy.",
    resource: "Mention a resource generically (no links) only if it adds value.",
  }

  return [
    "You are notCringe, an assistant that writes high-quality replies to social posts.",
    "Output must be a JSON object only.",
    "Generate 10-20 reply options across SAFE, INTERESTING, and BOLD categories.",
    "Avoid empty praise. Reference a concrete detail when possible.",
    "Keep replies professional, warm, and concise.",
    settings.noCringe
      ? "No cringe mode: avoid exclamation spam, forced hype, and thought-leader cliches."
      : "Allow more playful energy, but stay respectful.",
    `Persona: ${settings.persona}. Vibe: ${settings.vibe}. Risk: ${settings.risk}. Length: ${settings.length}.`,
    ctaHints[settings.cta],
    "Return JSON in this shape: { \"replies\": [{ \"category\": \"SAFE|INTERESTING|BOLD\", \"text\": \"...\", \"tags\": [\"...\"], \"lengthLabel\": \"short|medium|long\", \"score\": 0.0 }] }",
    "Tags should be 2-3 short reasons like: specific, framework, hook, respectful, value-add.",
    "Post text:",
    settings.postText,
  ].join("\n")
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      )
    }

    const settings = {
      ...defaults,
      ...parsed.data,
      postText: parsed.data.postText.trim(),
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    const prompt = buildPrompt(settings)

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: "You are a precise JSON generator." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content || ""
    let payload: unknown

    try {
      payload = JSON.parse(content)
    } catch {
      const start = content.indexOf("{")
      const end = content.lastIndexOf("}")
      if (start !== -1 && end !== -1) {
        payload = JSON.parse(content.slice(start, end + 1))
      }
    }

    const parsedResponse = ResponseSchema.safeParse(payload)
    if (!parsedResponse.success) {
      return NextResponse.json(
        { error: "Model output could not be parsed." },
        { status: 502 }
      )
    }

    const fallbackCategory: ReplyCategory =
      settings.risk === "bold" ? "BOLD" : settings.risk === "safe" ? "SAFE" : "INTERESTING"

    const replies = reorderReplies(parsedResponse.data.replies, fallbackCategory)

    return NextResponse.json({
      replies,
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate replies." },
      { status: 500 }
    )
  }
}
