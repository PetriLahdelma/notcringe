# Development Guide

Complete guide for developers working on notCringe. This covers local setup, development workflow, debugging, and best practices.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Project Structure Deep Dive](#project-structure-deep-dive)
- [Key Concepts](#key-concepts)
- [Debugging](#debugging)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Common Tasks](#common-tasks)
- [Tips and Tricks](#tips-and-tricks)

---

## Prerequisites

### Required

- **Node.js** 18.17 or higher
- **Package Manager:** npm, yarn, pnpm, or bun
- **Database:** PostgreSQL 13+
- **Code Editor:** VS Code recommended
- **Git**

### Recommended Tools

- **VS Code Extensions:**
  - [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [TypeScript Error Translator](https://marketplace.visualstudio.com/items?itemName=mattpocock.ts-error-translator)

- **Browser Extensions:**
  - [React Developer Tools](https://react.dev/learn/react-developer-tools)
  - [JSON Viewer](https://chromewebstore.google.com/detail/json-viewer)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/notcringe.git
cd notcringe

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/notcringe"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Development
NODE_ENV="development"
```

### 3. Database Setup

#### Option A: Local PostgreSQL

Install PostgreSQL:

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb notcringe

# Or use psql
psql postgres
CREATE DATABASE notcringe;
\q
```

#### Option B: Docker

```bash
docker run --name notcringe-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=notcringe \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud Database

Use Supabase/Neon for development (see [DEPLOYMENT.md](./DEPLOYMENT.md)).

### 4. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Optional: Open Prisma Studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Run migrations (if schema changed)
npm run db:migrate

# 4. Start dev server
npm run dev

# 5. Make changes...

# 6. Test locally
npm run build  # Check for build errors

# 7. Commit
git add .
git commit -m "feat: your changes"
git push
```

### Hot Reload

Next.js supports hot module replacement:

- **Component changes** - Instant reload
- **API route changes** - Automatic restart
- **Config changes** - Requires manual restart

### Environment Variables

Changes to `.env` require server restart:

```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

---

## Project Structure Deep Dive

### `/app` Directory

Next.js App Router structure:

```
app/
├── layout.tsx           # Root layout (wraps all pages)
├── page.tsx             # Home page (/)
├── globals.css          # Global styles
└── api/                 # API routes
    └── generate/
        └── route.ts     # POST /api/generate
```

**Key Files:**

#### `layout.tsx`

- Sets up HTML structure
- Loads fonts (Geist)
- Wraps all pages
- Can't use `useState` (server component)

#### `page.tsx`

- Landing page
- Server component by default
- Imports client components for interactivity

#### `api/generate/route.ts`

- Server-only code
- Can access environment variables safely
- Exports HTTP method handlers: `POST`, `GET`, etc.

### `/components` Directory

```
components/
├── demo-generator.tsx    # Main UI component
├── component-example.tsx # UI showcase
├── example.tsx           # Additional examples
└── ui/                   # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── select.tsx
    ├── textarea.tsx
    └── ...
```

**Client vs Server Components:**

```tsx
// Client component (uses state/effects)
"use client";
import { useState } from "react";

export function DemoGenerator() {
  const [loading, setLoading] = useState(false);
  // ...
}

// Server component (default)
export function LandingHero() {
  return <section>Static content</section>;
}
```

### `/lib` Directory

```
lib/
├── utils.ts       # Helper functions
└── prisma.ts      # Prisma client singleton
```

**utils.ts:**

- `cn()` - Class name merger (clsx + tailwind-merge)
- Add utility functions here

**prisma.ts:**

- Singleton pattern for Prisma Client
- Prevents connection leaks in development

### `/prisma` Directory

```
prisma/
├── schema.prisma    # Database schema
└── migrations/      # Migration history (auto-generated)
```

**schema.prisma:**

- Defines models (tables)
- Relationships
- Indexes
- Enums

---

## Key Concepts

### Reply Generation Flow

1. **User inputs** → DemoGenerator component
2. **API call** → POST `/api/generate`
3. **Validation** → Zod schema
4. **Prompt building** → Structured instructions
5. **LLM call** → OpenAI API
6. **Post-processing** → Normalize, rank, tag
7. **Reply ladder** → Organize into Safe/Interesting/Bold
8. **Response** → JSON back to client

### Reply Ladder Algorithm

The core algorithm organizes replies:

```typescript
// Target distribution
SAFE: 3 replies (30%)
INTERESTING: 5 replies (50%)
BOLD: 2 replies (20%)

// Algorithm ensures this split
function reorderReplies(replies) {
  // 1. Group by category
  const buckets = { SAFE: [], INTERESTING: [], BOLD: [] }

  // 2. Pick target count from each
  const safe = pick(SAFE, 3)
  const interesting = pick(INTERESTING, 5)
  const bold = pick(BOLD, 2)

  // 3. Fill shortages from leftovers
  if (safe.length < 3) fillFrom(leftovers)

  return [...safe, ...interesting, ...bold]
}
```

### Prompt Engineering

Located in `app/api/generate/route.ts`:

```typescript
const systemPrompt = `
You are an expert at writing social media replies that:
1. Add value without being cringe
2. Match the specified vibe (${vibe})
3. Reference specific details from the post
4. Avoid generic praise

Reply Angle Types:
- Agree + add nuance
- Agree + give framework
- Contrarian but respectful
- Personal anecdote (short)
- Tactical checklist
- Question that upgrades discussion
- Common failure mode
- Actionable example

Output JSON with:
{
  "replies": [
    {
      "category": "SAFE" | "INTERESTING" | "BOLD",
      "text": "...",
      "tags": ["specific", "value-add"],
      "score": 0.85
    }
  ]
}
`;
```

### Database Patterns

#### Singleton Prisma Client

```typescript
// lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### Querying

```typescript
// Create
const visitor = await prisma.visitor.create({
  data: {
    anonId: "anon_123",
    planTier: "FREE",
  },
});

// Find
const visitor = await prisma.visitor.findUnique({
  where: { anonId: "anon_123" },
});

// Update
await prisma.visitor.update({
  where: { id: visitor.id },
  data: { lastSeenAt: new Date() },
});

// Relations
const visitorWithGenerations = await prisma.visitor.findUnique({
  where: { id: "..." },
  include: {
    generations: true,
    voiceProfiles: true,
  },
});
```

---

## Debugging

### Server-Side Debugging

#### Console Logs

```typescript
// app/api/generate/route.ts
export async function POST(request: Request) {
  console.log("[API] Request received");
  const body = await request.json();
  console.log("[API] Body:", body);

  // ...

  console.log("[API] Replies generated:", replies.length);
  return NextResponse.json({ replies });
}
```

View logs in terminal where `npm run dev` is running.

#### VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

Set breakpoints in `route.ts` and run debugger.

### Client-Side Debugging

#### React DevTools

1. Install browser extension
2. Open DevTools → Components tab
3. Inspect component state/props

#### Console Logs

```typescript
// components/demo-generator.tsx
async function handleGenerate() {
  console.log("[Client] Generating replies for:", postText);

  const response = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify({ postText, vibe, risk }),
  });

  console.log("[Client] Response:", response.status);
  const data = await response.json();
  console.log("[Client] Replies:", data.replies);
}
```

#### Network Tab

Monitor API calls:

1. Open DevTools → Network
2. Filter by "Fetch/XHR"
3. Click request to see:
   - Request payload
   - Response data
   - Headers
   - Timing

### Database Debugging

#### Prisma Studio

```bash
npm run db:studio
```

Opens GUI at [http://localhost:5555](http://localhost:5555)

- View all tables
- Edit data
- Run queries

#### Query Logging

Enable in `lib/prisma.ts`:

```typescript
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

See SQL queries in terminal.

#### Raw SQL

```typescript
// For debugging
const result = await prisma.$queryRaw`
  SELECT * FROM "Visitor" WHERE "anonId" = 'anon_123'
`;
console.log(result);
```

---

## Testing

### Manual Testing

#### Test API Endpoint

```bash
# Using curl
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "postText": "Test post about shipping fast",
    "vibe": "nerdy",
    "risk": "medium"
  }' | jq
```

#### Test Database

```typescript
// Create test script: scripts/test-db.ts
import { prisma } from "./lib/prisma";

async function main() {
  const visitor = await prisma.visitor.create({
    data: {
      anonId: `test_${Date.now()}`,
      planTier: "FREE",
    },
  });
  console.log("Created:", visitor);

  const count = await prisma.visitor.count();
  console.log("Total visitors:", count);
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
```

Run:

```bash
npx tsx scripts/test-db.ts
```

### Unit Testing (Future)

Framework recommendations:

- **Vitest** - Fast, Vite-based
- **Jest** - Popular, mature

Example test:

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { deriveLengthLabel } from "@/lib/utils";

describe("deriveLengthLabel", () => {
  it("returns short for <= 12 words", () => {
    expect(deriveLengthLabel("This is a short reply")).toBe("short");
  });

  it("returns medium for 13-35 words", () => {
    const text = "This is a medium length reply with enough words";
    expect(deriveLengthLabel(text)).toBe("medium");
  });
});
```

### Integration Testing (Future)

Test API routes:

```typescript
// __tests__/api/generate.test.ts
import { POST } from "@/app/api/generate/route";

describe("POST /api/generate", () => {
  it("returns replies for valid input", async () => {
    const request = new Request("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        postText: "Test post",
        vibe: "diplomatic",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.replies).toHaveLength(10);
  });
});
```

---

## Performance Optimization

### Measuring Performance

#### API Latency

Add timing to API routes:

```typescript
export async function POST(request: Request) {
  const start = Date.now();

  // ... generation logic ...

  const latencyMs = Date.now() - start;
  console.log(`[Perf] Generation took ${latencyMs}ms`);

  return NextResponse.json({ replies, latencyMs });
}
```

#### React Performance

Use React DevTools Profiler:

1. Open DevTools → Profiler
2. Click "Record"
3. Interact with app
4. Stop and analyze

### Optimization Techniques

#### 1. Reduce LLM Token Count

```typescript
// Before
const prompt = `Very long detailed prompt...`; // 1000 tokens

// After
const prompt = `Concise prompt`; // 200 tokens
// 5x faster, 5x cheaper
```

#### 2. Parallel Processing (Future)

```typescript
// Instead of sequential
const replies1 = await generateReplies(post1);
const replies2 = await generateReplies(post2);

// Do parallel
const [replies1, replies2] = await Promise.all([
  generateReplies(post1),
  generateReplies(post2),
]);
```

#### 3. Database Query Optimization

```typescript
// Bad: N+1 queries
const visitors = await prisma.visitor.findMany();
for (const visitor of visitors) {
  const generations = await prisma.generation.findMany({
    where: { visitorId: visitor.id },
  });
}

// Good: Single query with relations
const visitors = await prisma.visitor.findMany({
  include: { generations: true },
});
```

#### 4. Component Optimization

```tsx
// Memoize expensive computations
const groupedReplies = React.useMemo(() => {
  return replies.reduce(
    (acc, reply) => {
      acc[reply.category].push(reply);
      return acc;
    },
    { SAFE: [], INTERESTING: [], BOLD: [] },
  );
}, [replies]); // Only recompute when replies change
```

---

## Common Tasks

### Adding a New API Endpoint

1. Create route file:

```bash
mkdir -p app/api/feedback
touch app/api/feedback/route.ts
```

2. Implement handler:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  generationId: z.string(),
  type: z.enum(["WORKED", "TOO_CRINGE", "TOO_LONG"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = Schema.parse(body);

    // ... implementation ...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
```

3. Test:

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"generationId": "...", "type": "WORKED"}'
```

### Adding a Database Model

1. Edit `prisma/schema.prisma`:

```prisma
model Initiative {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())

  @@index([createdAt])
}
```

2. Create migration:

```bash
npm run db:migrate
```

3. Generate client:

```bash
npm run db:generate
```

4. Use in code:

```typescript
const initiative = await prisma.initiative.create({
  data: {
    name: "Q1 Growth",
    description: "Focus on user acquisition",
  },
});
```

### Adding a UI Component

1. Create component:

```bash
touch components/voice-profile-selector.tsx
```

2. Implement:

```tsx
"use client";

interface VoiceProfileSelectorProps {
  profiles: { id: string; name: string }[];
  onSelect: (id: string) => void;
}

export function VoiceProfileSelector({
  profiles,
  onSelect,
}: VoiceProfileSelectorProps) {
  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      {profiles.map((profile) => (
        <option key={profile.id} value={profile.id}>
          {profile.name}
        </option>
      ))}
    </select>
  );
}
```

3. Use in page:

```tsx
import { VoiceProfileSelector } from '@/components/voice-profile-selector'

export default function Page() {
  return (
    <VoiceProfileSelector
      profiles={[...]}
      onSelect={(id) => console.log(id)}
    />
  )
}
```

---

## Tips and Tricks

### VS Code Shortcuts

- `Cmd+P` - Quick file open
- `Cmd+Shift+P` - Command palette
- `F12` - Go to definition
- `Shift+F12` - Find all references
- `Cmd+.` - Quick fix

### Prisma Tips

#### Reset Database

```bash
npx prisma migrate reset  # Careful: deletes all data!
```

#### Seed Database

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.visitor.create({
    data: {
      anonId: "demo_user",
      planTier: "PRO",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run:

```bash
npx prisma db seed
```

### TypeScript Tips

#### Get Types from Prisma

```typescript
import type { Visitor, Generation } from "@prisma/client";

// With relations
type VisitorWithGenerations = Visitor & {
  generations: Generation[];
};

// Or use Prisma's helper
import type { Prisma } from "@prisma/client";

type VisitorWithGenerations = Prisma.VisitorGetPayload<{
  include: { generations: true };
}>;
```

#### Infer Types from Zod

```typescript
const Schema = z.object({
  postText: z.string(),
  vibe: z.enum(["diplomatic", "direct"]),
});

type Request = z.infer<typeof Schema>;
// { postText: string; vibe: "diplomatic" | "direct" }
```

### Next.js Tips

#### Force Dynamic Route

```typescript
// app/api/generate/route.ts
export const dynamic = "force-dynamic";
// Disables caching for this route
```

#### Custom Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}
```

#### Loading UI

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

### Git Tips

#### Useful Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  st = status
  co = checkout
  br = branch
  cm = commit -m
  pl = pull
  ps = push
  lg = log --oneline --graph --decorate
```

#### Commit Message Template

```bash
feat(api): add feedback endpoint

- POST /api/feedback
- Validates input with Zod
- Stores feedback in database

Related: #123
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Prisma Client Out of Sync

```bash
npm run db:generate
```

#### TypeScript Errors After Pull

```bash
npm install
npm run db:generate
```

#### Hot Reload Not Working

1. Check file watcher limits (Linux):

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

2. Restart dev server

---

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Guides

- [PRD.md](../PRD.md) - Product requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [API.md](./API.md) - API reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

### Community

- GitHub Issues - Bug reports and features
- GitHub Discussions - Questions and ideas

---

Happy coding! If you have questions or suggestions for this guide, please open an issue or PR.
