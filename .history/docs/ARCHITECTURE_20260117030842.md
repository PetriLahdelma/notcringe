# Architecture Documentation

## Overview

notCringe is a Next.js 16 web application that generates high-quality, non-cringe social media replies using AI. The architecture is designed for fast iteration, low latency, and future extensibility (browser extension).

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library (via @base-ui/react)

### Backend

- **Next.js API Routes** - Server endpoints
- **OpenAI API** - LLM for reply generation
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Prisma)
- **Zod** - Runtime validation

### Deployment

- **Vercel** - Hosting (recommended)
- **Node.js runtime** - Server execution

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │   Web App UI     │         │  Browser Extension      │  │
│  │  (page.tsx)      │         │  (Future)               │  │
│  └────────┬─────────┘         └────────┬────────────────┘  │
└───────────┼──────────────────────────────┼─────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │ HTTP/JSON
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js Application                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              App Router (Next.js 16)                 │   │
│  │  ┌──────────────┐         ┌──────────────────────┐  │   │
│  │  │  app/page.tsx│         │ app/api/generate/    │  │   │
│  │  │  (Home)      │         │ route.ts (API)       │  │   │
│  │  └──────────────┘         └──────────┬───────────┘  │   │
│  └────────────────────────────────────────┼──────────────┘   │
│                                           │                  │
│  ┌────────────────────────────────────────▼──────────────┐  │
│  │              Business Logic Layer                      │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Validation  │  │  Prompting  │  │   Ranking   │  │  │
│  │  │   (Zod)      │  │   Engine    │  │   Engine    │  │  │
│  │  └──────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────┬──────────────────┘
                        │                  │
            ┌───────────▼─────┐   ┌────────▼─────────┐
            │   OpenAI API    │   │   PostgreSQL     │
            │   (GPT-4)       │   │   (Prisma)       │
            └─────────────────┘   └──────────────────┘
```

---

## Directory Structure

```
notcringe/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home page / landing
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/                  # API routes
│       └── generate/
│           └── route.ts      # Reply generation endpoint
├── components/               # React components
│   ├── demo-generator.tsx    # Main reply generator UI
│   ├── component-example.tsx # UI examples
│   ├── example.tsx           # Sample components
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── ...
├── lib/                      # Utility libraries
│   ├── utils.ts              # Helper functions
│   └── prisma.ts             # Prisma client
├── prisma/                   # Database
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── docs/                     # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
├── PRD.md                    # Product requirements
└── README.md                 # Project readme
```

---

## Data Flow

### Reply Generation Flow

1. **User Input**
   - User pastes post text
   - Selects vibe, risk, length, CTA, persona
   - Clicks "Generate"

2. **Request Validation** (`app/api/generate/route.ts`)
   - Zod schema validates input
   - Applies defaults for optional fields
   - Returns 400 if validation fails

3. **Prompt Construction**
   - Builds prompt with post text + user preferences
   - Includes safety instructions
   - Specifies reply angle types (8 patterns)

4. **LLM Generation** (OpenAI)
   - Calls GPT-4 with structured output
   - Requests 10-20 replies
   - JSON mode ensures valid schema

5. **Post-Processing**
   - Normalizes categories (SAFE/INTERESTING/BOLD)
   - Generates "why it works" tags
   - Computes length labels
   - Ranks replies by composite score

6. **Reply Ladder Organization**
   - Groups replies by category
   - Ensures distribution: 3 safe, 5 interesting, 2 bold
   - Fills from leftovers if needed

7. **Response**
   - Returns JSON with replies array
   - Includes latency metrics

---

## Database Schema

### Current Tables

```prisma
Visitor {
  id           String
  anonId       String @unique
  createdAt    DateTime
  lastSeenAt   DateTime?
  planTier     PlanTier (FREE/PRO/TEAM)
  defaultVibe  String?
  defaultRisk  String?
  noCringe     Boolean @default(true)

  voiceProfiles VoiceProfile[]
  generations  Generation[]
  savedPosts   SavedPost[]
  feedback     FeedbackEvent[]
}

VoiceProfile {
  id             String
  visitorId      String
  name           String
  doWords        String[]
  dontWords      String[]
  sentenceLength String?
  emojiAllowed   Boolean @default(false)
  tabooTopics    String[]
}

Generation {
  id          String
  visitorId   String
  postText    String
  vibe        String
  risk        String
  length      String
  cta         String
  persona     String
  replies     Json
  latencyMs   Int?
  createdAt   DateTime
}

SavedPost {
  id          String
  visitorId   String
  postUrl     String?
  postText    String
  postAuthor  String?
  tags        String[]
  revisitAt   DateTime?
}

FeedbackEvent {
  id          String
  visitorId   String
  generationId String
  replyText   String
  type        FeedbackType (WORKED/TOO_CRINGE/TOO_LONG)
  createdAt   DateTime
}
```

---

## Key Components

### 1. DemoGenerator (`components/demo-generator.tsx`)

Main UI component for reply generation.

**Responsibilities:**

- Collect user inputs (post text, vibe, risk, etc.)
- Call `/api/generate` endpoint
- Display reply ladder (Safe/Interesting/Bold)
- Handle copy-to-clipboard
- Show loading states and errors

**State:**

- Form inputs (postText, vibe, risk, length, cta, persona, noCringe)
- Generated replies array
- Loading/error states
- Copied reply index (for copy feedback)

**Key Features:**

- Sample post pre-filled for demo
- Grouped replies by category
- One-click copy
- Tags for each reply ("why it works")

### 2. API Route (`app/api/generate/route.ts`)

Server-side reply generation logic.

**Responsibilities:**

- Validate request with Zod
- Build AI prompt with user preferences
- Call OpenAI API with structured output
- Post-process replies (normalization, ranking, tagging)
- Organize reply ladder
- Return JSON response

**Key Functions:**

- `deriveLengthLabel()` - Calculates word count labels
- `normalizeCategory()` - Ensures valid category
- `ensureTagCount()` - Generates 2-3 tags per reply
- `reorderReplies()` - Organizes ladder (3 safe, 5 interesting, 2 bold)

**Safety Filters:**

- Explicit prompt instructions to avoid harassment, hate speech
- "noCringe" flag enables extra safety checks
- Bold ≠ hostile (respectful disagreement only)

### 3. Landing Page (`app/page.tsx`)

Marketing page with product explanation and demo.

**Sections:**

- Hero with value prop
- Reply ladder explanation
- How it works (3 steps)
- Interactive demo (DemoGenerator component)
- Social proof placeholders
- CTA to try the app

---

## Reply Generation Algorithm

### 1. Reply Angle Types

The prompt instructs the AI to generate 8 types of replies:

| Type               | Description                      | Example                                    |
| ------------------ | -------------------------------- | ------------------------------------------ |
| Agree + nuance     | Supportive but adds specificity  | "The weekly feedback point is underrated"  |
| Agree + framework  | Introduces a mental model        | "This maps to the 3-layer loop model"      |
| Contrarian         | Respectful disagreement          | "Hot take: it's not processes, it's trust" |
| Personal anecdote  | Short, relatable story           | "We tried this at X—shipped 2x faster"     |
| Tactical checklist | Actionable steps                 | "3 ways to reduce gates: ..."              |
| Upgrade question   | Question that deepens discussion | "What's the worst gate you've seen?"       |
| Failure mode       | Common mistake                   | "Most teams skip the synthesis step"       |
| Actionable example | Concrete template/tool           | "Try the DACI framework for decisions"     |

### 2. Ranking Signals

Composite score based on:

| Signal              | Weight | Description                 |
| ------------------- | ------ | --------------------------- |
| Specificity         | 25%    | References concrete details |
| Value-add           | 25%    | Adds tool/pattern/nuance    |
| Conversational hook | 20%    | Invites discussion          |
| Tone fit            | 15%    | Matches vibe/persona        |
| Brevity             | 10%    | 1-3 sentences ideal         |
| Non-salesy          | 5%     | Avoids self-promo           |

### 3. Reply Ladder Distribution

Target distribution:

- **SAFE:** 3 replies (30%)
- **INTERESTING:** 5 replies (50%)
- **BOLD:** 2 replies (20%)

Algorithm ensures this split, filling from leftovers if needed.

---

## Performance Considerations

### Latency Targets

- **P50:** < 4 seconds
- **P95:** < 6 seconds
- **P99:** < 8 seconds

### Optimization Strategies

1. **Prompt engineering** - Concise, structured prompts
2. **Parallel processing** - Future: batch multiple posts
3. **Caching** - Future: cache common post patterns
4. **Edge runtime** - Currently Node.js, consider Edge for lower latency
5. **Streaming** - Future: stream replies as they generate

### Database Queries

- Use Prisma connection pooling
- Index on `visitorId`, `createdAt`
- Paginate large result sets (Generation history)

---

## Security

### Current (MVP)

- No authentication (open API)
- Rate limiting: None (planned for production)
- Input validation with Zod
- Safety filters in prompt
- PostgreSQL prepared statements (via Prisma)

### Planned

- API key authentication
- Rate limiting by IP/user
- CORS configuration
- Content Security Policy headers
- Abuse detection (spam/malicious posts)

---

## Scalability

### Current Capacity

- Single OpenAI API key
- Serverless functions (Vercel)
- PostgreSQL database

### Scaling Strategy

1. **Horizontal:** Add more serverless instances (automatic on Vercel)
2. **Caching:** Redis for frequent post patterns
3. **CDN:** Static assets on edge network
4. **Database:** Connection pooling, read replicas
5. **LLM:** Multiple API keys, fallback providers

---

## Future Extensions

### Browser Extension

- Chrome extension manifest v3
- Inject on LinkedIn/X/Reddit posts
- Context menu: "Generate reply with notCringe"
- One-click copy to platform text box

### Mobile App

- React Native or PWA
- Share sheet integration
- Offline mode with cached replies

### API for Developers

- Public API with rate limits
- Webhooks for async generation
- Batch endpoints

---

## Monitoring and Observability

### Metrics to Track

- **Latency:** P50, P95, P99 for `/api/generate`
- **Error rate:** 4xx, 5xx responses
- **Usage:** Requests per hour/day
- **LLM costs:** OpenAI API spend
- **Quality:** Feedback events (worked/cringe/long)

### Tools (Planned)

- Vercel Analytics
- OpenAI usage dashboard
- Prisma logging
- Sentry for error tracking

---

## Development Workflow

### Local Development

```bash
npm run dev              # Start Next.js dev server
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio GUI
```

### Testing

```bash
npm test                 # Run tests (to be added)
npm run lint             # Lint with ESLint (to be added)
```

### Deployment

```bash
npm run build            # Build for production
npm start                # Start production server
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

---

## Dependencies

### Critical Dependencies

- `next@16.1.3` - Framework
- `react@19.2.3` - UI library
- `openai@^6.16.0` - LLM client
- `@prisma/client@^7.2.0` - Database ORM
- `zod@^4.3.5` - Validation

### UI Dependencies

- `@base-ui/react` - Base UI components
- `tailwind-merge` - CSS utility merging
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes

---

## Design Decisions

### Why Next.js 16?

- App Router for modern React patterns
- Server components for faster loads
- API routes for serverless backend
- React 19 compiler for automatic optimization

### Why Prisma?

- Type-safe database access
- Migration tooling
- Studio GUI for debugging
- PostgreSQL support

### Why OpenAI?

- Best-in-class language understanding
- Structured output mode (JSON schema)
- Reliable latency
- Easy to swap providers later

### Why Zod?

- Runtime validation (TypeScript only checks at compile time)
- Schema reuse for client/server
- Better error messages
- Integration with Prisma

---

## Changelog

### v0.1.0 (Current)

- Initial architecture
- Next.js 16 + React 19
- OpenAI integration
- Prisma database
- Reply ladder algorithm
- Demo UI
