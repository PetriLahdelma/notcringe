import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const RequestSchema = z.object({
  anonId: z.string().min(1),
  generationId: z.string().optional(),
  replyId: z.string().optional(),
  type: z.enum(["worked", "too_cringe", "too_long"]),
})

const typeMap = {
  worked: "WORKED",
  too_cringe: "TOO_CRINGE",
  too_long: "TOO_LONG",
} as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 })
    }

    const visitor = await prisma.visitor.upsert({
      where: { anonId: parsed.data.anonId },
      update: { lastSeenAt: new Date() },
      create: { anonId: parsed.data.anonId, lastSeenAt: new Date() },
    })

    await prisma.feedbackEvent.create({
      data: {
        visitorId: visitor.id,
        generationId: parsed.data.generationId ?? null,
        replyId: parsed.data.replyId ?? null,
        type: typeMap[parsed.data.type],
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 })
  }
}
