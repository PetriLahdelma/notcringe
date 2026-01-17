# Frequently Asked Questions (FAQ)

Common questions about notCringe - what it is, how it works, and how to use it.

## Table of Contents

- [General](#general)
- [Product](#product)
- [Technical](#technical)
- [Development](#development)
- [Pricing & Plans](#pricing--plans)
- [Privacy & Security](#privacy--security)

---

## General

### What is notCringe?

notCringe is an AI-powered tool that generates high-quality social media replies for LinkedIn, X (Twitter), and other platforms. It helps you engage meaningfully without spending hours crafting comments or worrying about sounding awkward.

### Who is notCringe for?

- **"Quiet Killers"** - Strong operators who want to engage publicly without spending hours
- **Growth-Minded Builders** - Professionals testing engagement strategies
- **BD/Recruiting** - People building relationships through thoughtful comments
- Anyone who wants to comment more but struggles with time or confidence

### Why should I use notCringe instead of ChatGPT?

notCringe is specifically designed for social media replies:

| Feature             | notCringe                | ChatGPT                       |
| ------------------- | ------------------------ | ----------------------------- |
| Reply Ladder        | ✅ Safe/Interesting/Bold | ❌ Generic list               |
| "Why it works" tags | ✅ Explains each reply   | ❌ No explanation             |
| Vibe control        | ✅ 5 preset tones        | ⚠️ Must prompt manually       |
| Safety filters      | ✅ Prevents cringe       | ⚠️ Requires careful prompting |
| Ranking             | ✅ Ranked by impact      | ❌ Random order               |
| One-click copy      | ✅ Built-in              | ❌ Manual copy                |

### Is it free?

Currently in MVP, the web app is free to use. Future plans include:

- **Free tier:** 20 replies/hour
- **Pro tier:** 500 replies/hour + voice profiles
- **Team tier:** 2000 replies/hour + team features

---

## Product

### What platforms does notCringe support?

Currently supports any text-based post from:

- LinkedIn
- X (Twitter)
- Reddit
- Facebook
- Any social media platform

**Coming soon:** Browser extension for one-click generation directly on platform pages.

### What is the "Reply Ladder"?

The Reply Ladder organizes replies by risk level:

- **Safe (3 replies)** - Supportive, specific, low-risk. Perfect for professional contexts.
- **Interesting (5 replies)** - Adds frameworks, nuance, or examples. More memorable.
- **Bold (2 replies)** - Tasteful contrarian or strong POV. Gets noticed but respectful.

### What are "vibes"?

Vibes control the tone of your replies:

- **Diplomatic** - Supportive, consensus-building, safe
- **Direct** - Clear, concise, no fluff
- **Playful** - Light, witty, approachable
- **Nerdy** - Technical, frameworks, precise
- **Contrarian** - Questions assumptions, offers alternative views

### What are "personas"?

Personas adjust the professional voice:

- **Builder** - Product/engineering focus
- **Designer** - UX/visual design perspective
- **PM** - Strategic, user-centric
- **Founder** - Business, growth, vision
- **Recruiter/BD** - Relationship-building, networking

### What does "noCringe" mean?

noCringe mode (enabled by default) filters out:

- Generic praise ("Great post!")
- Over-the-top enthusiasm
- Salesy or promotional language
- Try-hard or awkward phrasing
- Anything that sounds fake

### How are replies ranked?

Replies are ranked by a composite score based on:

| Signal              | Weight | Description                  |
| ------------------- | ------ | ---------------------------- |
| Specificity         | 25%    | References concrete details  |
| Value-add           | 25%    | Adds tools, patterns, nuance |
| Conversational hook | 20%    | Invites discussion           |
| Tone fit            | 15%    | Matches vibe/persona         |
| Brevity             | 10%    | 1-3 sentences ideal          |
| Non-salesy          | 5%     | Avoids self-promo            |

### Can I customize my voice?

**MVP:** Use persona and vibe presets.

**Coming soon:** Voice profiles where you can specify:

- Do/don't words
- Sentence length preferences
- Emoji preferences
- Taboo topics

### Can I save posts for later?

**Coming soon:** Saved posts library where you can:

- Bookmark posts to reply to later
- Set reminders to revisit
- Tag posts by topic
- Track which posts you've engaged with

### Does notCringe actually post for me?

**No.** We never auto-post. You always:

1. Review the reply
2. Edit if needed
3. Manually paste and post

This keeps you in control and avoids platform policy issues.

---

## Technical

### How does it work?

1. You paste a post
2. Select preferences (vibe, risk, length, etc.)
3. notCringe sends the post + preferences to OpenAI's GPT-4
4. GPT-4 generates 10-20 reply candidates
5. Our algorithm ranks and organizes them into the Reply Ladder
6. You get Safe/Interesting/Bold replies with "why it works" tags

### What AI model does it use?

GPT-4 from OpenAI. We chose it for:

- Best language understanding
- Ability to follow complex instructions
- Consistent quality
- JSON output mode

### How fast is it?

- **Median:** < 4 seconds
- **P95:** < 6 seconds
- Usually 2-5 seconds depending on post length

### Does it read the original post author's profile?

**Not yet.** Currently only reads:

- Post text
- (Optional) Top comments for context

**Future:** Browser extension will access author name and basic context.

### Can I use it offline?

No. notCringe requires internet to:

- Call OpenAI API
- Access database
- Load web app

**Future consideration:** Cache common patterns for offline mode.

### What data does notCringe store?

We store:

- Anonymous visitor ID (for usage tracking)
- Generation history (post text + replies generated)
- Feedback events (if you mark replies as worked/cringe/long)
- Voice profiles (when feature launches)

**We do NOT store:**

- Your social media credentials
- Your actual posts or engagements
- Personal identifying information (unless you provide it)

See our [Privacy Policy](#privacy--security) for details.

---

## Development

### Is notCringe open source?

**Yes!** (or specify your license)

Repository: [github.com/your-org/notcringe](https://github.com/your-org/notcringe)

License: MIT (or your chosen license)

### Can I self-host notCringe?

Yes! See our [Deployment Guide](./docs/DEPLOYMENT.md) for:

- Self-hosting on your own server
- Docker deployment
- Kubernetes setup

Requirements:

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### How can I contribute?

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for:

- Code of conduct
- Development setup
- Coding standards
- Pull request process

### What's the tech stack?

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **AI:** OpenAI GPT-4
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui
- **Hosting:** Vercel

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

### How do I report bugs?

1. Check [existing issues](https://github.com/your-org/notcringe/issues)
2. If not found, [create new issue](https://github.com/your-org/notcringe/issues/new)
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/error messages
   - Environment (OS, browser, Node version)

### How do I request features?

1. Check [existing discussions](https://github.com/your-org/notcringe/discussions)
2. If not found, start a new discussion
3. Describe:
   - What problem does it solve?
   - How would it work?
   - Why is it important?

---

## Pricing & Plans

### How much does it cost?

**MVP (Current):** Free, unlimited use

**Planned tiers:**

| Tier | Price  | Limit              | Features                    |
| ---- | ------ | ------------------ | --------------------------- |
| Free | $0/mo  | 20 requests/hour   | Basic features              |
| Pro  | $19/mo | 500 requests/hour  | Voice profiles, saved posts |
| Team | $49/mo | 2000 requests/hour | Team sharing, analytics     |

### Why will it have usage limits?

Each request costs money (OpenAI API fees). Limits ensure:

- Sustainable operation
- Fair usage
- Prevent abuse

### Can I get more requests?

In the future:

- **Pro tier:** Higher limits
- **Team tier:** Even higher limits
- **Enterprise:** Custom limits

### Is there a student discount?

Not yet, but we're considering:

- Student discounts
- Open source contributor credits
- Educational institution plans

### What payment methods do you accept?

**Future:** Credit card via Stripe (most likely)

---

## Privacy & Security

### Is my data private?

Yes. We:

- ✅ Store only what's necessary for functionality
- ✅ Use encrypted database connections
- ✅ Follow security best practices
- ✅ Don't sell your data
- ❌ Don't share with third parties (except OpenAI for generation)

### Does OpenAI see my posts?

Yes. When you generate replies:

1. We send the post text to OpenAI
2. OpenAI generates replies
3. OpenAI may store the request (per their policy)

**OpenAI's data policy:** [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy)

**Note:** Don't paste sensitive or confidential information.

### Can I delete my data?

**Future:** Account dashboard with:

- View all your data
- Export your data
- Delete your account and data

**Current:** Email us to request deletion (support@notcringe.com if set up)

### Is it secure?

Yes. We use:

- ✅ HTTPS encryption
- ✅ Environment variable secrets
- ✅ SQL injection protection (Prisma)
- ✅ Input validation (Zod)
- ✅ Security headers
- ✅ Regular dependency updates

See [SECURITY.md](./SECURITY.md) for our security policy.

### How do I report security issues?

**Do NOT** open a public issue.

**Do:** Email security@notcringe.com (if set up) or create a [private security advisory](https://github.com/your-org/notcringe/security/advisories/new)

See [SECURITY.md](./SECURITY.md) for details.

### Is the browser extension safe?

**When it launches:**

- ✅ Open source (auditable)
- ✅ Minimal permissions
- ✅ Only reads post text when you click
- ✅ Never auto-posts
- ✅ No tracking or analytics (optional)

---

## Still Have Questions?

### Documentation

- **[README](../README.md)** - Getting started
- **[PRD](../PRD.md)** - Product vision
- **[API Docs](./docs/API.md)** - API reference
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical design
- **[Development](./docs/DEVELOPMENT.md)** - Developer guide
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues

### Community

- **GitHub Issues** - [Bug reports and features](https://github.com/your-org/notcringe/issues)
- **GitHub Discussions** - [Questions and ideas](https://github.com/your-org/notcringe/discussions)
- **Discord** - [Real-time chat](https://discord.gg/notcringe) (if set up)
- **Twitter** - [@notcringe](https://twitter.com/notcringe) (if set up)

### Contact

- **Email:** support@notcringe.com (if set up)
- **Twitter DM:** [@notcringe](https://twitter.com/notcringe) (if set up)

---

**Can't find your answer? [Open a discussion](https://github.com/your-org/notcringe/discussions/new) and ask!**
