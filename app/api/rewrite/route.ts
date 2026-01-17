import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const RequestSchema = z.object({
  text: z.string().min(1).max(2000),
  action: z.enum(["shorten", "spice", "safer"]),
  anchors: z.array(z.string()).min(1),
  vibe: z.enum(["diplomatic", "direct", "playful", "nerdy", "contrarian"]).optional(),
  risk: z.enum(["safe", "medium", "bold"]).optional(),
  length: z.enum(["one-liner", "two-three", "paragraph"]).optional(),
  cta: z.enum(["none", "question", "invite", "resource"]).optional(),
  persona: z.enum(["builder", "designer", "pm", "founder", "recruiter"]).optional(),
  noCringe: z.boolean().optional(),
})

const ResponseSchema = z.object({
  text: z.string().min(1),
})

function deriveLengthLabel(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words <= 12) return "short"
  if (words <= 35) return "medium"
  return "long"
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function ensureAnchor(text: string, anchors: string[]) {
  const normalizedText = normalizeForMatch(text)
  for (const anchor of anchors) {
    const normalizedAnchor = normalizeForMatch(anchor)
    if (normalizedAnchor && normalizedText.includes(normalizedAnchor)) {
      return text
    }
  }
  const anchor = anchors[0]
  const suffix = text.endsWith(".") ? "" : "."
  return `${text}${suffix} That part about ${anchor} stands out.`
}

function buildPrompt(payload: z.infer<typeof RequestSchema>) {
  const actionHints: Record<typeof payload.action, string> = {
    shorten: "Shorten to one crisp sentence (<= 20 words) while keeping meaning.",
    spice: "Make it bolder and more interesting, still respectful and professional.",
    safer: "Make it more cautious, diplomatic, and low-risk.",
  }

  return [
    "You are notCringe, an assistant that rewrites replies for social posts.",
    "Output must be a JSON object only.",
    actionHints[payload.action],
    payload.noCringe
      ? "No cringe mode: avoid exclamation spam, forced hype, and thought-leader cliches."
      : "Allow a bit more playful energy, but stay respectful.",
    payload.persona ? `Persona: ${payload.persona}.` : null,
    payload.vibe ? `Vibe: ${payload.vibe}.` : null,
    payload.risk ? `Risk: ${payload.risk}.` : null,
    payload.length ? `Target length: ${payload.length}.` : null,
    payload.cta ? `CTA: ${payload.cta}.` : null,
    "Keep at least one anchor phrase verbatim in the rewrite.",
    "Anchors (must appear verbatim):",
    ...payload.anchors.map((anchor) => `- ${anchor}`),
    "Reply to rewrite:",
    payload.text,
    "Return JSON in this shape: { \"text\": \"...\" }",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    const prompt = buildPrompt(parsed.data)

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.5,
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
      return NextResponse.json({ error: "Model output could not be parsed." }, { status: 502 })
    }

    const text = ensureAnchor(parsedResponse.data.text.trim(), parsed.data.anchors)

    return NextResponse.json({
      text,
      lengthLabel: deriveLengthLabel(text),
    })
  } catch {
    return NextResponse.json({ error: "Failed to rewrite reply." }, { status: 500 })
  }
}
