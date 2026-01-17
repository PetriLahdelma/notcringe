# PRD: notCringe

Product: notCringe (web app + browser extension)

One-liner: Paste a post -> get ranked replies that sound human, match your vibe, and increase the odds you get noticed without being cringe.

## 1) Problem statement

### What's broken today

People want visibility but don't want to become "a poster."

Commenting is the highest-leverage growth tactic, but:

- It's cognitively expensive (finding the angle, tone, and length).
- People default to generic praise -> ignored.
- People fear sounding cringe, try-hard, or overly promotional.

### Opportunity

Provide instant, high-quality, vibe-aligned reply options with a clear ladder from safe -> bold, plus lightweight guidance on why a reply works.

## 2) Goals and non-goals

### Goals

- Generate 10-20 reply candidates in seconds.
- Rank replies by predicted impact and fit (not "best writing").
- Offer a reply ladder (safe -> interesting -> bold).
- Maintain "professional but not boring" as default.
- Make the workflow frictionless via browser extension.

### Non-goals (initially)

- Full post generation / scheduling.
- Auto-posting (too risky + platform policy issues).
- Long-term "content strategy coaching" product.
- Guaranteeing virality (we optimize probability, not promise outcomes).

## 3) Target users and personas

### Persona A: "Quiet killer" (primary)

- Strong operator (design/dev/PM/founder), minimal posting.
- Wants to appear smart in public without spending time.
- Fear: sounding cringe or political.

### Persona B: "Growth-minded builder"

- Posts occasionally, wants faster engagement loops.
- Will test multiple tones, likes iteration.

### Persona C: "Recruiting/BD"

- Uses comments to build relationships and open doors.
- Needs tone control + "not salesy" guardrails.

## 4) Jobs to be done (JTBD)

- When I see a post in my niche, I want to leave a comment that adds value, so that I'm remembered and get profile clicks.
- When I don't have time to think, I want ready-to-use options, so that I still show up consistently.
- When I worry about cringe, I want guardrails and tone presets, so that I don't embarrass myself.

## 5) Core user journey

### Primary flow (extension)

- User is on LinkedIn/X post -> clicks notCringe icon.
- notCringe reads:
  - Post text (and optionally the top few comments).
- User chooses:
  - Persona (Default / My saved voice)
  - Vibe (Diplomatic / Direct / Playful / Contrarian / Nerdy)
  - Risk level (Safe / Medium / Bold)
  - Optional: CTA (none / question / resource)
- notCringe returns:
  - Ranked list of replies with labels (Safe / Spicy / Bold).
  - "Why it works" tags (1-3 short reasons).
  - One-click copy.
- User optionally:
  - Generates follow-up thread comments.
  - Saves the post to revisit.
  - Logs outcome later (lightweight feedback loop).

### Secondary flow (web app)

- Paste a post URL or text -> same generation + saved library + analytics.

## 6) Features (MVP)

### 6.1 Reply ladder (must-have)

Output grouped into:

- Safe (3-5): supportive but specific, non-cringe
- Interesting (4-8): adds a framework, example, or nuance
- Bold (2-5): tasteful contrarian or strong point of view

### 6.2 Ranking (must-have)

Rank replies based on a composite score:

| Signal | Description | Why it matters |
| --- | --- | --- |
| Specificity | References a concrete detail from the post | Avoids generic replies |
| Value-add | Adds a tool, pattern, nuance, or example | Increases save/share/like likelihood |
| Conversational hook | Includes an inviting question or prompt | Drives replies |
| Tone fit | Matches chosen vibe/persona | Reduces cringe risk |
| Brevity control | Default 1-3 sentences | Comment readability |
| Non-salesy | Avoids self-promo patterns by default | Trust |

### 6.3 Angle generator (must-have)

Reply types (at least 8):

- Agree + add nuance
- Agree + give a mini-framework
- Contrarian but respectful
- Personal anecdote (short)
- Tactical checklist
- Question that upgrades the discussion
- Common failure mode
- Actionable example / template

### 6.4 Persona and voice (must-have-lite)

Presets:

- Builder
- Designer
- PM
- Founder
- Recruiter/BD

User can save Voice Profile:

- do/don't words
- typical sentence length
- emoji allowed? (default: none)
- taboo topics

### 6.5 Safety filters (must-have)

Prevent:

- harassment
- targeted insults
- hate/identity attacks
- instructions for wrongdoing

"Bold" != hostile.

Blocklist of high-risk phrases + classifier pass.

### 6.6 Feedback loop (nice-to-have in MVP if cheap)

- "This one worked" / "Too cringe" / "Too long" quick buttons.
- Used to refine ranking and personalization.

## 7) Out of scope (MVP)

- Auto-detecting user's full brand voice from history (later).
- Multi-language (later).
- Team workspace with roles/approval (later).
- Sentiment-based comment timing optimization (later).

## 8) Functional requirements

### Inputs

- Post text (required)
- Optional:
  - Post author handle/name
  - Topic tags inferred from post
  - Top comments (0-5) for context

### Outputs

- 10-20 replies total
- Each reply contains:
  - Reply text
  - Ladder category (Safe / Interesting / Bold)
  - Rank score (internal)
  - "Why it works" tags (2-3)
  - Length label: short/medium

### Controls

- Vibe: Diplomatic / Direct / Playful / Nerdy / Contrarian
- Risk: Safe / Medium / Bold
- Length: 1-liner / 2-3 sentences / mini-paragraph
- CTA: none / question / invite / resource mention

## 9) Non-functional requirements

### Performance

- Generate results in < 4 seconds median on normal posts.
- Extension UI load < 500ms.

### Reliability

- Graceful fallback when DOM scraping fails:
  - Ask user to paste text.
- Safe mode default if any policy risk is detected.

### Privacy and data

- Default: do not store post content unless user saves it.
- If stored: encrypt at rest, allow deletion.
- No scraping beyond what user is viewing.

## 10) UX requirements (specific)

### Extension UI

- Compact panel:
  - Top: vibe + risk dropdowns
  - Middle: Generate and Regenerate
  - Results: collapsible sections (Safe / Interesting / Bold)

Each reply row:

- Copy button
- Tags (e.g., "specific", "hook question", "framework")
- "Shorten" and "Spice up" micro-actions

### "Why it works"

Must be short and non-annoying:

Example tags:

- References a concrete detail
- Adds a useful framework
- Invites author response
- Respectful counterpoint

### Anti-cringe guardrail

A visible toggle: "No cringe mode" (default on)

Bans:

- excessive exclamation
- empty praise
- overly "thought-leader" phrases
- self-aggrandizing

## 11) Content quality rules (the "notCringe standard")

Replies must:

- Avoid empty praise ("Love this!") unless immediately followed by value.
- Reference at least one concrete element from the post when possible.
- Prefer one strong point over multiple weak points.
- Avoid jargon unless the post uses it.
- Avoid self-promo unless user explicitly enables "Mention my thing."

## 12) Ranking and generation approach (implementation-neutral)

### Generation

Create candidates across angle types (section 6.3).

For each candidate:

- Apply tone constraints (vibe + risk + no-cringe mode)
- Enforce length constraint

### Scoring (example)

Score =

- 0.25 Specificity +
- 0.25 ValueAdd +
- 0.20 Hook +
- 0.15 ToneFit +
- 0.10 Brevity +
- 0.05 SafetyConfidence

Then:

- Ensure diversity (don't show 10 variants of the same idea).
- Force at least:
  - 3 safe, 5 interesting, 2 bold.

## 13) Analytics and success metrics

### North Star Metric

Weekly "successful comment sessions": sessions where user copies a reply and later marks it as "worked" (or at minimum copies + stays active).

### Supporting metrics

- Time to first usable reply
- Copy rate per session
- Regenerate rate (too high = quality problem)
- "Too cringe" downvotes
- Retention: W1/W4 returning users
- Conversion: free -> paid

## 14) Monetization / packaging (initial)

### Free

- 5 generations/day
- 1 persona
- basic vibes

### Pro (EUR 10-EUR 20/mo)

- Unlimited generations
- Saved voice profiles
- Reply ladder + thread builder
- Saved library

### Team (later)

- Shared persona packs
- Brand guardrails
- Approval flows

## 15) Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cringe output | Trust-killer | No-cringe mode + specificity requirement + short defaults |
| Policy/safety issues | Account bans / harm | Safety filter + bold != hostile + blocklists |
| Platform DOM changes | Extension breaks | Fallback to paste text; rapid patching |
| Generic AI vibe | Low adoption | Persona tuning + tags + concise replies |

## 16) Roadmap (realistic sequencing)

### Phase 1 (MVP)

- Web app paste-text flow
- Reply ladder + ranking
- Vibe + risk + length controls
- Copy + regenerate

### Phase 2

- Browser extension for LinkedIn (then X)
- Saved voice profiles
- Basic library + folders

### Phase 3

- Thread builder + follow-up ladders
- Learning from feedback loop
- Team/brand mode

## 17) Open questions (you can decide later)

- Do we optimize for author reply vs likes vs profile clicks? (Different scoring weights.)
- Do we allow "Mention my product" mode as a paid feature, or keep it hidden to avoid spam vibes?
- Do we support comment context (top comments) by default, or only when user toggles it?

## Optional add-ons

If you want, I can also produce:

- MVP scope as Jira epics/stories
- UI wireframe spec (panel layout + states)
- A prompt + rubric you can plug into your model to enforce the "notCringe standard" consistently.
