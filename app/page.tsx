import type { CSSProperties } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DemoGenerator } from "@/components/demo-generator"

const ladder = [
  {
    title: "Safe",
    description: "Supportive, specific, and low-risk.",
    example:
      "The point about weekly feedback loops is underrated. That small cadence keeps projects honest.",
  },
  {
    title: "Interesting",
    description: "Adds a framework or sharp nuance.",
    example:
      "This maps nicely to a 3-layer loop: signal, synthesis, and share. Most teams skip the synthesis step.",
  },
  {
    title: "Bold",
    description: "Tasteful contrarian take without the hostility.",
    example:
      "Hot take: visibility is not a reward for consistency, it is a reward for clarity. The post hints at that.",
  },
]

const steps = [
  {
    title: "Paste a post",
    description: "Drop in text or a link. We only read what you see.",
  },
  {
    title: "Pick the vibe",
    description: "Diplomatic, direct, playful, nerdy, or contrarian.",
  },
  {
    title: "Get the ladder",
    description: "Safe to bold replies ranked by impact, not fluff.",
  },
]

const vibes = ["Diplomatic", "Direct", "Playful", "Nerdy", "Contrarian"]

const previewReplies = [
  {
    label: "Safe",
    text: "Great call on keeping the scope small. Shipping beats polishing the 10th edge case.",
    tags: ["specific", "brevity", "tone-fit"],
  },
  {
    label: "Interesting",
    text: "This reads like a risk budget. Spend it on high-variance experiments, not extra meetings.",
    tags: ["framework", "value-add", "hook"],
  },
  {
    label: "Bold",
    text: "Counterpoint: the hardest part is not focus, it is saying no in public.",
    tags: ["respectful", "contrast", "memorable"],
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-[120px] motion-safe:animate-[float-slow_12s_ease-in-out_infinite]" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-lime-300/30 blur-[140px] motion-safe:animate-[float-slow_14s_ease-in-out_infinite] motion-safe:[animation-delay:1.5s]" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
        </div>

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-700">
              NC
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                notCringe
              </span>
              <span className="text-xs text-muted-foreground">Ranked replies that land</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
              Private beta
            </Badge>
            <Button asChild size="sm">
              <Link href="#demo">Try the demo</Link>
            </Button>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit bg-emerald-500/10 text-emerald-700">
              Paste a post -&gt; get ranked replies
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Be the comment people remember, not the one they scroll past.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              notCringe turns any post into a ladder of replies from safe to bold. Each option is
              ranked for impact, tone fit, and clarity so you can show up without the cringe.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-lg shadow-emerald-500/20">
                Generate replies
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#ladder">See the ladder</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "10-20 replies", value: "per post" },
                { label: "<4s", value: "median generation" },
                { label: "No-cringe mode", value: "on by default" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-emerald-500/15 bg-background/80 px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative border-emerald-500/20 bg-background/80 shadow-xl shadow-emerald-500/10">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-700">
                  Live preview
                </Badge>
                <span className="text-xs text-muted-foreground">Vibe: nerdy</span>
              </div>
              <CardTitle className="text-base font-semibold">Post excerpt</CardTitle>
              <p className="text-sm text-muted-foreground">
                "Shipping fast is less about speed and more about removing hidden approval steps."
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Reply ladder
              </div>
              <div className="grid gap-3">
                {previewReplies.map((reply) => (
                  <div
                    key={reply.label}
                    className="rounded-xl border border-emerald-500/10 bg-muted/50 p-3 text-sm shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                        {reply.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Rank A</span>
                    </div>
                    <p className="text-sm text-foreground">{reply.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reply.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-border/70 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-emerald-500/10">
              <Button size="sm" variant="outline">
                Copy best reply
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground">
                Regenerate
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20" id="demo">
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Try the demo</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Paste a post, pick a vibe, and get the ladder. No signup needed.
              </p>
            </div>
            <div className="grid gap-6 rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-transparent to-lime-200/30 px-6 py-10 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-emerald-500/15 bg-background/90 p-6 shadow-sm motion-safe:animate-[fade-up_0.7s_ease-out_both] motion-safe:[animation-delay:calc(0.12s*var(--step))]"
                  style={{ "--step": index + 1 } as CSSProperties}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-700">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <DemoGenerator />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20" id="ladder">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">The reply ladder</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pick the rung that matches your intent. Same voice, different risk.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {vibes.map((vibe) => (
              <Badge key={vibe} variant="outline" className="border-emerald-500/30 text-emerald-700">
                {vibe}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {ladder.map((item) => (
            <Card key={item.title} className="border-emerald-500/15">
              <CardHeader>
                <Badge variant="secondary" className="w-fit bg-emerald-500/10 text-emerald-700">
                  {item.title}
                </Badge>
                <CardTitle className="text-lg">{item.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{item.example}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Why it works: specificity + tone fit.
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-emerald-500/15">
            <CardHeader>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-700">
                No cringe mode
              </Badge>
              <CardTitle className="text-2xl">Guardrails that keep it human.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-muted-foreground">
              <p>
                We block empty praise, forced hype, and self-promo unless you explicitly toggle it.
                Bold replies are still respectful, and every option gets a quick reason tag.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "References a concrete detail",
                  "Adds a useful framework",
                  "Invites the author to respond",
                  "Keeps it short and clean",
                ].map((tag) => (
                  <div key={tag} className="rounded-lg border border-emerald-500/15 bg-muted/40 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Tag
                    </span>
                    <p className="mt-1 text-sm text-foreground">{tag}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/15">
            <CardHeader>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-700">
                Controls
              </Badge>
              <CardTitle className="text-2xl">Dial the risk and length.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-semibold text-foreground">
                  {["Safe", "Medium", "Bold"].map((risk) => (
                    <div key={risk} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Length</p>
                <div className="mt-2 grid gap-2">
                  {["1-liner", "2-3 sentences", "Mini paragraph"].map((length) => (
                    <div key={length} className="rounded-lg border border-emerald-500/10 bg-muted/40 px-3 py-2 text-foreground">
                      {length}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Built for speed. Never posts for you.
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit bg-emerald-500/20 text-emerald-700">
              Web app only for now
            </Badge>
            <h2 className="text-3xl font-semibold">Be visible without becoming a poster.</h2>
            <p className="text-sm text-muted-foreground">
              Paste a post, pick a vibe, and walk away with replies that actually add value. No
              templates. No cringe. Just clean options that sound like you.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full">
              Join the private beta
            </Button>
            <Button size="lg" variant="outline" className="w-full">
              See sample replies
            </Button>
            <p className="text-xs text-muted-foreground">
              Free tier includes 5 generations per day. Pro unlocks unlimited runs and saved voices.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl border-t border-emerald-500/10 px-6 py-8 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>notCringe. Ranked replies without the cringe.</span>
          <span>Built for builders, designers, and quiet killers.</span>
        </div>
      </footer>
    </main>
  )
}
