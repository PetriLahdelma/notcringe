import { createHash } from "crypto"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const RequestSchema = z.object({
  postText: z.string().min(1).max(5000),
  vibe: z.enum(["diplomatic", "direct", "playful", "nerdy", "contrarian"]).optional(),
  risk: z.enum(["safe", "medium", "bold"]).optional(),
  length: z.enum(["one-liner", "two-three", "paragraph"]).optional(),
  cta: z.enum(["none", "question", "invite", "resource"]).optional(),
  persona: z.enum(["builder", "designer", "pm", "founder", "recruiter"]).optional(),
  noCringe: z.boolean().optional(),
  anonId: z.string().min(1).optional(),
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

type RequestPayload = z.infer<typeof RequestSchema>
type Reply = z.infer<typeof ReplySchema>
type ReplyWithAnchor = Reply & { anchor?: string }
type ReplyCategory = "SAFE" | "INTERESTING" | "BOLD"
type PromptSettings = {
  postText: string
  vibe: NonNullable<RequestPayload["vibe"]>
  risk: NonNullable<RequestPayload["risk"]>
  length: NonNullable<RequestPayload["length"]>
  cta: NonNullable<RequestPayload["cta"]>
  persona: NonNullable<RequestPayload["persona"]>
  noCringe: NonNullable<RequestPayload["noCringe"]>
}
type Defaults = Omit<PromptSettings, "postText">
type CtaOption = PromptSettings["cta"]

const defaults: Defaults = {
  vibe: "diplomatic",
  risk: "medium",
  length: "two-three",
  cta: "none",
  persona: "builder",
  noCringe: true,
}

const CACHE_TTL_MS = 1000 * 60 * 10
const responseCache = new Map<
  string,
  { expiresAt: number; value: { anchors: string[]; replies: ReplyWithAnchor[]; model: string } }
>()

function getCachedResponse(cacheKey: string) {
  const entry = responseCache.get(cacheKey)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    responseCache.delete(cacheKey)
    return null
  }
  return entry.value
}

function setCachedResponse(
  cacheKey: string,
  value: { anchors: string[]; replies: ReplyWithAnchor[]; model: string }
) {
  responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value })
}

function createCacheKey(settings: PromptSettings) {
  const payload = {
    postText: settings.postText,
    vibe: settings.vibe,
    risk: settings.risk,
    length: settings.length,
    cta: settings.cta,
    persona: settings.persona,
    noCringe: settings.noCringe,
  }
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

function extractAnchors(postText: string) {
  const lines = postText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const candidates = lines.length ? lines : postText.split(/(?<=[.!?])\s+/)
  const anchors: string[] = []

  for (const candidate of candidates) {
    const cleaned = candidate.replace(/\s+/g, " ").trim()
    if (!cleaned) continue
    const words = cleaned.split(" ")
    const anchor = words.length > 10 ? words.slice(0, 10).join(" ") : cleaned
    const trimmed = anchor.replace(/[.,!?;:]+$/, "").trim()
    if (trimmed.length < 4) continue
    if (!anchors.includes(trimmed)) {
      anchors.push(trimmed)
    }
    if (anchors.length >= 3) break
  }

  if (!anchors.length) {
    const words = postText.replace(/\s+/g, " ").trim().split(" ").filter(Boolean)
    if (words.length) {
      anchors.push(words.slice(0, Math.min(words.length, 8)).join(" "))
    }
  }

  return anchors
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function findAnchorMatch(text: string, anchors: string[]) {
  const normalizedText = normalizeForMatch(text)
  for (const anchor of anchors) {
    const normalizedAnchor = normalizeForMatch(anchor)
    if (normalizedAnchor && normalizedText.includes(normalizedAnchor)) {
      return anchor
    }
  }
  return null
}

function enforceAnchors(replies: Reply[], anchors: string[]) {
  return replies.map((reply, index) => {
    const match = findAnchorMatch(reply.text, anchors)
    if (match) {
      return { ...reply, anchor: match }
    }
    const anchor = anchors[index % anchors.length]
    const suffix = reply.text.endsWith(".") ? "" : "."
    return {
      ...reply,
      text: `${reply.text}${suffix} That part about ${anchor} is the key.`,
      anchor,
    }
  })
}

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

function reorderReplies(replies: ReplyWithAnchor[], fallback: ReplyCategory) {
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

function buildPrompt(settings: PromptSettings, anchors: string[]) {
  const ctaHints: Record<CtaOption, string> = {
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
    "Every reply must reference at least one anchor phrase verbatim.",
    "Keep replies professional, warm, and concise.",
    settings.noCringe
      ? "No cringe mode: avoid exclamation spam, forced hype, and thought-leader cliches."
      : "Allow more playful energy, but stay respectful.",
    `Persona: ${settings.persona}. Vibe: ${settings.vibe}. Risk: ${settings.risk}. Length: ${settings.length}.`,
    ctaHints[settings.cta],
    "Return JSON in this shape: { \"replies\": [{ \"category\": \"SAFE|INTERESTING|BOLD\", \"text\": \"...\", \"tags\": [\"...\"], \"lengthLabel\": \"short|medium|long\", \"score\": 0.0 }] }",
    "Tags should be 2-3 short reasons like: specific, framework, hook, respectful, value-add.",
    "Anchors (must be quoted verbatim in every reply):",
    ...anchors.map((anchor) => `- ${anchor}`),
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

    const settings: PromptSettings = {
      postText: parsed.data.postText.trim(),
      vibe: parsed.data.vibe ?? defaults.vibe,
      risk: parsed.data.risk ?? defaults.risk,
      length: parsed.data.length ?? defaults.length,
      cta: parsed.data.cta ?? defaults.cta,
      persona: parsed.data.persona ?? defaults.persona,
      noCringe: parsed.data.noCringe ?? defaults.noCringe,
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    const cacheKey = createCacheKey(settings)
    const cached = getCachedResponse(cacheKey)

    let anchors = extractAnchors(settings.postText)
    let replies: ReplyWithAnchor[] = []
    let usedModel = model

    if (cached) {
      anchors = cached.anchors
      replies = cached.replies
      usedModel = cached.model
    } else {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const prompt = buildPrompt(settings, anchors)

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
        settings.risk === "bold"
          ? "BOLD"
          : settings.risk === "safe"
            ? "SAFE"
            : "INTERESTING"

      const anchoredReplies = enforceAnchors(parsedResponse.data.replies, anchors)
      replies = reorderReplies(anchoredReplies, fallbackCategory)
      setCachedResponse(cacheKey, { anchors, replies, model })
    }

    let generationId: string | null = null
    let responseReplies = replies

    if (parsed.data.anonId && process.env.DATABASE_URL) {
      try {
        const visitor = await prisma.visitor.upsert({
          where: { anonId: parsed.data.anonId },
          update: { lastSeenAt: new Date() },
          create: { anonId: parsed.data.anonId, lastSeenAt: new Date() },
        })

        const generation = await prisma.generation.create({
          data: {
            visitorId: visitor.id,
            settings: {
              vibe: settings.vibe,
              risk: settings.risk,
              length: settings.length,
              cta: settings.cta,
              persona: settings.persona,
              noCringe: settings.noCringe,
              anchors,
            },
            model: usedModel,
            latencyMs: Date.now() - startedAt,
            replyCount: replies.length,
          },
        })

        const createdReplies = await prisma.$transaction(
          replies.map((reply) =>
            prisma.reply.create({
              data: {
                generationId: generation.id,
                category: normalizeCategory(reply.category, "INTERESTING"),
                text: reply.text,
                tags: reply.tags ?? [],
                score: reply.score ?? 0.5,
                lengthLabel: reply.lengthLabel ?? deriveLengthLabel(reply.text),
              },
            })
          )
        )

        generationId = generation.id
        responseReplies = replies.map((reply, index) => ({
          ...reply,
          id: createdReplies[index]?.id,
        }))
      } catch {
        generationId = null
      }
    }

    return NextResponse.json({
      anchors,
      generationId,
      replies: responseReplies,
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate replies." },
      { status: 500 }
    )
  }
}
