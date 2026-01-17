import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DemoGenerator } from "./demo-generator"

const generateResponse = {
  replies: [
    {
      category: "SAFE",
      text: "Safe one",
      tags: ["specific"],
      lengthLabel: "short",
    },
    {
      category: "SAFE",
      text: "Safe two",
      tags: ["specific"],
      lengthLabel: "short",
    },
    {
      category: "INTERESTING",
      text: "Interesting one",
      tags: ["framework"],
      lengthLabel: "short",
    },
    {
      category: "BOLD",
      text: "Bold one",
      tags: ["hook"],
      lengthLabel: "short",
    },
  ],
  anchors: ["Shipping fast"],
  generationId: null,
}

const rewriteResponse = {
  text: "Interesting rewritten",
  lengthLabel: "short",
}

describe("DemoGenerator", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString()
        if (url.endsWith("/api/generate")) {
          return new Response(JSON.stringify(generateResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        }
        if (url.endsWith("/api/rewrite")) {
          return new Response(JSON.stringify(rewriteResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        }
        return new Response("Not Found", { status: 404 })
      })
    )
  })

  it("rewrites the intended reply, not the first item in the list", async () => {
    render(<DemoGenerator />)

    const generateButton = screen.getByRole("button", { name: /generate replies/i })
    fireEvent.click(generateButton)

    const interestingText = await screen.findByText("Interesting one")
    const card = interestingText.closest("[data-reply-key]") as HTMLElement
    expect(card).toBeTruthy()

    const spiceButton = within(card).getByRole("button", { name: /spice up/i })
    fireEvent.click(spiceButton)

    await screen.findByText("Interesting rewritten")

    expect(screen.getByText("Safe one")).toBeInTheDocument()
  })
})
