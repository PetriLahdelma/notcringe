// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

const upsert = vi.fn()
const findGeneration = vi.fn()
const findReply = vi.fn()
const createFeedback = vi.fn()

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      visitor: { upsert },
      generation: { findFirst: findGeneration },
      reply: { findFirst: findReply },
      feedbackEvent: { create: createFeedback },
    },
  }
})

describe("POST /api/feedback", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/notcringe"
    upsert.mockResolvedValue({ id: "visitor-1" })
    findGeneration.mockReset()
    findReply.mockReset()
    createFeedback.mockReset()
  })

  it("requires a generationId or replyId", async () => {
    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId: "anon", type: "worked" }),
      })
    )

    expect(response.status).toBe(400)
    expect(createFeedback).not.toHaveBeenCalled()
  })

  it("rejects replies that don't belong to the generation", async () => {
    findGeneration.mockResolvedValue({ id: "gen-1" })
    findReply.mockResolvedValue({ id: "reply-1", generationId: "gen-2" })

    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId: "anon",
          generationId: "gen-1",
          replyId: "reply-1",
          type: "worked",
        }),
      })
    )

    expect(response.status).toBe(400)
    expect(createFeedback).not.toHaveBeenCalled()
  })

  it("returns 404 when replyId is not found for the visitor", async () => {
    findReply.mockResolvedValue(null)

    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId: "anon",
          replyId: "reply-404",
          type: "too_cringe",
        }),
      })
    )

    expect(response.status).toBe(404)
    expect(createFeedback).not.toHaveBeenCalled()
  })
})
