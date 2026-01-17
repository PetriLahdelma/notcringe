"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const vibes = ["diplomatic", "direct", "playful", "nerdy", "contrarian"] as const
const risks = ["safe", "medium", "bold"] as const
const lengths = ["one-liner", "two-three", "paragraph"] as const
const ctas = ["none", "question", "invite", "resource"] as const
const personas = ["builder", "designer", "pm", "founder", "recruiter"] as const

const labelMap = {
  diplomatic: "Diplomatic",
  direct: "Direct",
  playful: "Playful",
  nerdy: "Nerdy",
  contrarian: "Contrarian",
  safe: "Safe",
  medium: "Medium",
  bold: "Bold",
  "one-liner": "1-liner",
  "two-three": "2-3 sentences",
  paragraph: "Mini paragraph",
  none: "None",
  question: "Question",
  invite: "Invite",
  resource: "Resource",
  builder: "Builder",
  designer: "Designer",
  pm: "PM",
  founder: "Founder",
  recruiter: "Recruiter/BD",
} as const

type ReplyCategory = "SAFE" | "INTERESTING" | "BOLD"

type GeneratedReply = {
  id?: string
  category: ReplyCategory
  text: string
  tags: string[]
  lengthLabel: string
  score?: number
  anchor?: string
}

type GenerateResponse = {
  replies: GeneratedReply[]
  anchors?: string[]
  generationId?: string | null
  latencyMs?: number
}

type RewriteResponse = {
  text: string
  lengthLabel?: string
}

type FeedbackType = "worked" | "too_cringe" | "too_long"

const samplePost =
  "Shipping fast is less about speed and more about removing hidden approval steps. \n\nMost teams already have the talent. They just need fewer gates."

const categoryBadge: Record<ReplyCategory, string> = {
  SAFE: "bg-emerald-500/10 text-emerald-700",
  INTERESTING: "bg-amber-500/10 text-amber-700",
  BOLD: "bg-rose-500/10 text-rose-700",
}

export function DemoGenerator() {
  const [postText, setPostText] = React.useState(samplePost)
  const [vibe, setVibe] = React.useState<(typeof vibes)[number]>("nerdy")
  const [risk, setRisk] = React.useState<(typeof risks)[number]>("medium")
  const [length, setLength] = React.useState<(typeof lengths)[number]>("two-three")
  const [cta, setCta] = React.useState<(typeof ctas)[number]>("question")
  const [persona, setPersona] = React.useState<(typeof personas)[number]>("builder")
  const [noCringe, setNoCringe] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [replies, setReplies] = React.useState<GeneratedReply[]>([])
  const [anchors, setAnchors] = React.useState<string[]>([])
  const [generationId, setGenerationId] = React.useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
  const [actionLoading, setActionLoading] = React.useState<Record<string, boolean>>({})
  const [feedbackSent, setFeedbackSent] = React.useState<Record<string, FeedbackType>>({})
  const [anonId, setAnonId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const key = "notcringe_anon_id"
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null
    if (stored) {
      setAnonId(stored)
      return
    }
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `nc_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, generated)
    }
    setAnonId(generated)
  }, [])

  const groupedReplies = React.useMemo(() => {
    return replies.reduce(
      (acc, reply) => {
        acc[reply.category].push(reply)
        return acc
      },
      { SAFE: [] as GeneratedReply[], INTERESTING: [] as GeneratedReply[], BOLD: [] as GeneratedReply[] }
    )
  }, [replies])

  async function handleGenerate() {
    setError(null)
    if (!postText.trim()) {
      setError("Paste a post to get replies.")
      return
    }
    setLoading(true)
    setAnchors([])
    setGenerationId(null)
    setFeedbackSent({})
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postText,
          vibe,
          risk,
          length,
          cta,
          persona,
          noCringe,
          anonId,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Generation failed. Try again.")
      }

      const data = (await response.json()) as GenerateResponse
      setReplies(data.replies || [])
      setAnchors(data.anchors || [])
      setGenerationId(data.generationId ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      setCopiedIndex(null)
    }
  }

  async function handleRewrite(
    reply: GeneratedReply,
    index: number,
    action: "shorten" | "spice" | "safer"
  ) {
    if (!anchors.length) return
    const actionKey = `${reply.id ?? index}-${action}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: reply.text,
          action,
          anchors,
          vibe,
          risk,
          length,
          cta,
          persona,
          noCringe,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Rewrite failed. Try again.")
      }

      const data = (await response.json()) as RewriteResponse
      setReplies((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
                ...item,
                text: data.text,
                lengthLabel: data.lengthLabel ?? item.lengthLabel,
              }
            : item
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  async function handleFeedback(reply: GeneratedReply, type: FeedbackType) {
    if (!anonId || !reply.id) return
    if (feedbackSent[reply.id]) return
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId,
          generationId,
          replyId: reply.id,
          type,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Feedback failed. Try again.")
      }

      setFeedbackSent((prev) => ({ ...prev, [reply.id!]: type }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
    }
  }

  return (
    <Card className="border-emerald-500/20 bg-background/90 shadow-xl shadow-emerald-500/10">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
            Live demo
          </Badge>
          <span className="text-xs text-muted-foreground">No cringe mode: {noCringe ? "On" : "Off"}</span>
        </div>
        <CardTitle className="text-xl">Generate replies</CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste a post, set your vibe, and get a ranked ladder in seconds.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Textarea
            value={postText}
            onChange={(event) => setPostText(event.target.value)}
            rows={6}
            placeholder="Paste a post here..."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Vibe
              </label>
              <Select value={vibe} onValueChange={(value) => setVibe(value as (typeof vibes)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select vibe" />
                </SelectTrigger>
                <SelectContent>
                  {vibes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelMap[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Risk
              </label>
              <Select value={risk} onValueChange={(value) => setRisk(value as (typeof risks)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select risk" />
                </SelectTrigger>
                <SelectContent>
                  {risks.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelMap[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Length
              </label>
              <Select value={length} onValueChange={(value) => setLength(value as (typeof lengths)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelMap[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                CTA
              </label>
              <Select value={cta} onValueChange={(value) => setCta(value as (typeof ctas)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select CTA" />
                </SelectTrigger>
                <SelectContent>
                  {ctas.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelMap[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Persona
              </label>
              <Select value={persona} onValueChange={(value) => setPersona(value as (typeof personas)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelMap[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-muted/40 px-3 py-2 text-sm">
            <span>No cringe mode</span>
            <button
              type="button"
              onClick={() => setNoCringe((prev) => !prev)}
              className={`h-6 w-11 rounded-full border transition ${
                noCringe ? "border-emerald-500/40 bg-emerald-500/20" : "border-border bg-background"
              }`}
              aria-pressed={noCringe}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  noCringe ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {error ? (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Replies</p>
            {replies.length ? (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-700">
                {replies.length} options
              </Badge>
            ) : null}
          </div>
          {anchors.length ? (
            <div className="rounded-xl border border-emerald-500/10 bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Anchors
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {anchors.map((anchor) => (
                  <Badge key={anchor} variant="outline" className="border-border/70 text-[10px]">
                    {anchor}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          {replies.length === 0 && !loading ? (
            <div className="rounded-xl border border-emerald-500/10 bg-muted/40 p-4 text-sm text-muted-foreground">
              Generate to see the ladder here.
            </div>
          ) : null}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-xl border border-emerald-500/10 bg-muted/50" />
              ))}
            </div>
          ) : null}
          <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {Object.entries(groupedReplies).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{category}</span>
                  <span>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((reply, index) => {
                    const actionBaseKey = `${reply.id ?? index}`
                    const shortenKey = `${actionBaseKey}-shorten`
                    const spiceKey = `${actionBaseKey}-spice`
                    const saferKey = `${actionBaseKey}-safer`
                    const feedbackState = reply.id ? feedbackSent[reply.id] : undefined

                    return (
                      <div
                        key={`${category}-${index}`}
                        className="rounded-xl border border-emerald-500/10 bg-background/80 p-3 text-sm shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className={categoryBadge[reply.category]}>{reply.category}</Badge>
                          <span className="text-xs text-muted-foreground">{reply.lengthLabel}</span>
                        </div>
                        <p className="text-sm text-foreground">{reply.text}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {reply.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-border/70 text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleCopy(reply.text, index)}
                          >
                            {copiedIndex === index ? "Copied" : "Copy"}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!anchors.length || actionLoading[shortenKey]}
                            onClick={() => handleRewrite(reply, index, "shorten")}
                          >
                            {actionLoading[shortenKey] ? "Shortening..." : "Shorten"}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!anchors.length || actionLoading[spiceKey]}
                            onClick={() => handleRewrite(reply, index, "spice")}
                          >
                            {actionLoading[spiceKey] ? "Spicing..." : "Spice up"}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!anchors.length || actionLoading[saferKey]}
                            onClick={() => handleRewrite(reply, index, "safer")}
                          >
                            {actionLoading[saferKey] ? "Softening..." : "Safer"}
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-[0.2em]">Feedback</span>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!reply.id || feedbackState === "worked"}
                            onClick={() => handleFeedback(reply, "worked")}
                          >
                            Worked
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!reply.id || feedbackState === "too_cringe"}
                            onClick={() => handleFeedback(reply, "too_cringe")}
                          >
                            Too cringe
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={!reply.id || feedbackState === "too_long"}
                            onClick={() => handleFeedback(reply, "too_long")}
                          >
                            Too long
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-emerald-500/10">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate replies"}
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">No auto-posting. Ever.</p>
      </CardFooter>
    </Card>
  )
}
