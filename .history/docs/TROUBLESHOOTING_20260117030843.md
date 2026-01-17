# Troubleshooting Guide

Common issues and solutions when developing or deploying notCringe.

## Table of Contents

- [Development Issues](#development-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Development Issues

### Dev Server Won't Start

**Symptom:** `npm run dev` fails or crashes

**Solution 1: Port Already in Use**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**Solution 2: Dependencies Not Installed**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Solution 3: TypeScript Errors**

```bash
# Regenerate Prisma client
npm run db:generate

# Check tsconfig.json is valid
npx tsc --noEmit
```

### Hot Reload Not Working

**Symptom:** Changes don't appear without manual refresh

**Solution 1: File Watcher Limits (Linux)**

```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Solution 2: Next.js Cache**

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Solution 3: Restart Dev Server**

```bash
# Stop (Ctrl+C) and restart
npm run dev
```

### Module Not Found Errors

**Symptom:** `Cannot find module '@/components/...'`

**Solution 1: Check Aliases**

Ensure `tsconfig.json` has correct paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Solution 2: Restart TypeScript Server**

In VS Code:

1. `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
2. Type "TypeScript: Restart TS Server"
3. Select and run

**Solution 3: Reinstall Dependencies**

```bash
npm ci  # Clean install from lock file
```

---

## Database Issues

### Cannot Connect to Database

**Symptom:** `Error: Can't reach database server at localhost:5432`

**Solution 1: PostgreSQL Not Running**

```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux (systemd)
sudo systemctl start postgresql

# Docker
docker start notcringe-db
```

**Solution 2: Wrong Connection String**

Check `.env`:

```bash
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/notcringe"
```

Common mistakes:

- Missing `postgresql://` prefix
- Wrong port (default is 5432)
- Wrong database name
- Wrong password

**Solution 3: Database Doesn't Exist**

```bash
# Create database
createdb notcringe

# Or using psql
psql postgres
CREATE DATABASE notcringe;
\q
```

**Solution 4: Firewall/Security Group**

For cloud databases:

- Check firewall allows your IP
- Verify security group rules
- Ensure SSL is configured if required: `?sslmode=require`

### Prisma Client Not Generated

**Symptom:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
# Generate Prisma client
npm run db:generate

# If still failing, try
npx prisma generate

# Ensure postinstall script in package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Migration Fails

**Symptom:** `Error: Migration failed`

**Solution 1: Database Out of Sync**

```bash
# Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

**Solution 2: Schema Conflicts**

```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration-name>

# Then re-run
npm run db:migrate
```

**Solution 3: Permission Issues**

Ensure database user has CREATE privileges:

```sql
GRANT CREATE ON DATABASE notcringe TO postgres;
```

### Too Many Connections

**Symptom:** `Error: too many clients already`

**Solution 1: Close Unused Connections**

```bash
# Check connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

**Solution 2: Use Connection Pooling**

For production, use Prisma connection pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Pooled
  directUrl = env("DIRECT_URL")  // Direct (for migrations)
}
```

**Solution 3: Increase Max Connections**

Edit PostgreSQL config (`postgresql.conf`):

```
max_connections = 100
```

Then restart PostgreSQL.

---

## API Issues

### API Returns 400 Bad Request

**Symptom:** `/api/generate` returns validation error

**Solution 1: Check Request Body**

Ensure JSON is valid:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "postText": "Valid text here",
    "vibe": "diplomatic"
  }'
```

Common mistakes:

- Missing `postText` (required)
- Invalid enum values (check API.md for valid options)
- Wrong Content-Type header

**Solution 2: Check Console Logs**

View terminal where `npm run dev` is running for validation errors.

### API Returns 500 Internal Server Error

**Symptom:** Server crashes or returns 500

**Solution 1: Check OpenAI API Key**

```bash
# Verify key is set
echo $OPENAI_API_KEY

# Test key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Solution 2: Check Error Logs**

```typescript
// Add detailed logging in app/api/generate/route.ts
export async function POST(request: Request) {
  try {
    // ... your code ...
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { error: "Generation failed", message: error.message },
      { status: 500 },
    );
  }
}
```

**Solution 3: OpenAI Rate Limit**

Check usage at [platform.openai.com/usage](https://platform.openai.com/usage)

Set usage limits:

1. Billing → Usage Limits
2. Set hard cap

### API Timeout

**Symptom:** Request hangs or times out after 10s

**Solution 1: Optimize Prompt**

Reduce token count in prompt:

```typescript
// Before: 1000 tokens
const prompt = `Very detailed long prompt...`;

// After: 200 tokens
const prompt = `Concise prompt`;
```

**Solution 2: Use Faster Model**

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini", // Faster than gpt-4
  // ...
});
```

**Solution 3: Increase Timeout**

For Vercel Pro:

- Settings → Functions → Timeout
- Set to 60s (Pro tier required)

---

## Deployment Issues

### Build Fails on Vercel

**Symptom:** "Build failed" error during deployment

**Solution 1: Prisma Client Not Generated**

Add to `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**Solution 2: Environment Variables Missing**

Check Vercel dashboard:

1. Settings → Environment Variables
2. Ensure `DATABASE_URL` and `OPENAI_API_KEY` are set
3. Make sure they're set for Production environment

**Solution 3: TypeScript Errors**

```bash
# Check locally
npm run build

# Fix errors, then redeploy
git add .
git commit -m "fix: build errors"
git push
```

### Database Connection Fails in Production

**Symptom:** "Can't reach database server" in production

**Solution 1: Check Connection String**

Ensure `DATABASE_URL` in Vercel includes SSL:

```
postgresql://user:pass@host:5432/db?sslmode=require
```

**Solution 2: Verify Database Accessibility**

For cloud databases:

- Supabase: Check "Connection Pooling" is enabled
- Neon: Use "Pooled connection" string
- Railway: Ensure public networking is enabled

**Solution 3: Run Migrations**

Migrations might not have run:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### Environment Variables Not Working

**Symptom:** `process.env.OPENAI_API_KEY` is undefined

**Solution 1: Prefix for Client-Side**

Client-side variables need `NEXT_PUBLIC_` prefix:

```bash
# Server-side only (secure)
OPENAI_API_KEY="sk-..."

# Client-side (public)
NEXT_PUBLIC_APP_URL="https://..."
```

**Solution 2: Restart Dev Server**

Changes to `.env` require restart:

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

**Solution 3: Check .env File Location**

Ensure `.env` or `.env.local` is in root directory:

```
notcringe/
├── .env          ← Here
├── app/
├── components/
└── ...
```

### Custom Domain Not Working

**Symptom:** Domain shows "Domain Not Found"

**Solution 1: DNS Propagation**

DNS changes take time (up to 48 hours). Check status:

```bash
dig your-domain.com
# or
nslookup your-domain.com
```

**Solution 2: Check DNS Records**

Verify DNS settings:

```
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com
```

**Solution 3: Remove from Other Projects**

Domain can only be on one Vercel project. Remove from old project first.

---

## Performance Issues

### API Very Slow (> 10s)

**Symptom:** Generation takes longer than expected

**Solution 1: Check OpenAI Status**

Visit [status.openai.com](https://status.openai.com)

**Solution 2: Reduce Token Count**

```typescript
// Shorter prompts = faster responses
const prompt = buildPrompt(postText, options);
console.log("Tokens:", prompt.length / 4); // Rough estimate
```

**Solution 3: Use Streaming (Future)**

```typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4",
  stream: true,
  // ...
});

for await (const chunk of stream) {
  // Send chunks as they arrive
}
```

### High Database Latency

**Symptom:** Queries take seconds

**Solution 1: Add Indexes**

```prisma
model Visitor {
  id         String   @id @default(cuid())
  anonId     String   @unique
  createdAt  DateTime @default(now())

  @@index([createdAt])  ← Add indexes
  @@index([anonId])
}
```

Then migrate:

```bash
npm run db:migrate
```

**Solution 2: Use `select` Instead of `include`**

```typescript
// Bad: Fetches everything
const visitor = await prisma.visitor.findUnique({
  where: { id: "..." },
  include: { generations: true },
});

// Good: Only what you need
const visitor = await prisma.visitor.findUnique({
  where: { id: "..." },
  select: {
    id: true,
    anonId: true,
    generations: {
      take: 10,
      orderBy: { createdAt: "desc" },
    },
  },
});
```

**Solution 3: Connection Pooling**

Ensure Prisma client uses singleton pattern (see `lib/prisma.ts`).

### High Memory Usage

**Symptom:** Process crashes with "JavaScript heap out of memory"

**Solution 1: Increase Memory Limit**

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

**Solution 2: Fix Memory Leaks**

Common causes:

- Not closing Prisma connections
- Storing large data in memory
- Circular references

**Solution 3: Use Streaming**

For large responses, stream instead of buffering:

```typescript
// Instead of loading all at once
const allReplies = await loadAllReplies(); // 100MB

// Stream in chunks
for await (const chunk of replyStream()) {
  yield chunk;
}
```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Common issues are documented here
2. **Search Issues** - [GitHub Issues](https://github.com/your-org/notcringe/issues)
3. **Check logs** - Terminal output often shows the error
4. **Try minimal reproduction** - Isolate the problem

### Debugging Checklist

- [ ] Latest code pulled from main
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Database running and accessible
- [ ] Prisma client generated
- [ ] Migrations run
- [ ] Dev server restarted
- [ ] Browser cache cleared

### Asking for Help

When opening an issue, include:

**1. Environment Info**

```bash
node --version
npm --version
# OS (macOS, Windows, Linux)
# Database (PostgreSQL version)
```

**2. Error Message**

```
Full error message with stack trace
```

**3. Steps to Reproduce**

```
1. Run npm run dev
2. Navigate to /api/generate
3. Send POST request with {...}
4. See error
```

**4. Expected vs Actual**

```
Expected: API returns replies
Actual: 500 error
```

**5. Screenshots/Logs**

Attach relevant screenshots or log files.

### Resources

- **Documentation:** `docs/` folder
- **PRD:** [PRD.md](../PRD.md)
- **API Docs:** [API.md](./API.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development:** [DEVELOPMENT.md](./DEVELOPMENT.md)

### Community

- **GitHub Issues** - Bug reports
- **GitHub Discussions** - Questions and ideas
- **Discord** - Real-time help (if set up)

### Contact

- **Email:** support@notcringe.com (if applicable)
- **Twitter:** @notcringe (if applicable)

---

## FAQ

### Q: Why is my API key not working?

**A:** Check:

1. Key is in `.env` file
2. Format: `OPENAI_API_KEY="sk-..."`
3. No extra spaces or quotes
4. Dev server restarted after adding key

### Q: Can I use a different LLM?

**A:** Yes, but requires code changes. Replace OpenAI calls in `app/api/generate/route.ts` with your LLM provider.

### Q: Why are replies taking so long?

**A:**

- Normal: 3-6 seconds
- Slow: > 6 seconds
- Check OpenAI status and your prompt size

### Q: How do I reset my database?

**A:**

```bash
# WARNING: Deletes all data!
npx prisma migrate reset
```

### Q: Can I run without a database?

**A:** Not currently. Database is required for visitor tracking and analytics. You could modify code to make it optional.

### Q: How do I change the port?

**A:**

```bash
PORT=3001 npm run dev
```

### Q: Why isn't my .env file loaded?

**A:**

- Must be named `.env` or `.env.local`
- Must be in root directory
- Restart dev server after changes

---

## Still Stuck?

If this guide doesn't solve your issue:

1. Open a [GitHub Issue](https://github.com/your-org/notcringe/issues/new)
2. Use the bug report template
3. Include all relevant information from the "Asking for Help" section

We're here to help! 🚀
