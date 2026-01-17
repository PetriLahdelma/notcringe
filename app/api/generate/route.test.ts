// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockCreate = vi.fn()

vi.mock("openai", () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      }
    },
  }
})

describe("POST /api/generate", () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it("rejects whitespace-only postText", async () => {
    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postText: "   " }),
      })
    )

    expect(response.status).toBe(400)
  })

  it("enforces anchors when the model omits them", async () => {
    process.env.OPENAI_API_KEY = "test-key"
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              replies: [{ text: "No anchor here.", category: "SAFE" }],
            }),
          },
        },
      ],
    })

    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postText: "Shipping fast removes hidden approval steps." }),
      })
    )

    const payload = (await response.json()) as { anchors: string[]; replies: { text: string }[] }
    expect(payload.anchors.length).toBeGreaterThan(0)
    expect(payload.replies[0].text).toContain(payload.anchors[0])
  })
})
