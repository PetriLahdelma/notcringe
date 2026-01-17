# notCringe

> Paste a post → get ranked replies that sound human, match your vibe, and increase the odds you get noticed without being cringe.

## Overview

**notCringe** is an AI-powered web app that generates high-quality social media replies for LinkedIn, X (Twitter), and other platforms. It helps professionals engage meaningfully without spending hours crafting comments or worrying about sounding awkward.

### Key Features

- 🎯 **Reply Ladder** - Get 10-20 replies organized by risk level: Safe, Interesting, and Bold
- 🎨 **Vibe Control** - Choose from Diplomatic, Direct, Playful, Nerdy, or Contrarian tones
- 🏷️ **"Why It Works" Tags** - Every reply comes with 2-3 reasons explaining its effectiveness
- ⚡ **Fast Generation** - Get replies in under 4 seconds (median)
- 🛡️ **Safety Filters** - Built-in "noCringe" mode prevents awkward or inappropriate content
- 📋 **One-Click Copy** - Instantly copy replies to your clipboard

### Who It's For

- **"Quiet Killers"** - Strong operators who want to engage publicly without spending hours
- **Growth-Minded Builders** - Professionals testing engagement strategies
- **BD/Recruiting** - People building relationships through thoughtful comments

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/notcringe.git
cd notcringe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Web App

1. Paste the post text you want to reply to
2. Select your preferences:
   - **Vibe** - Tone of the replies (diplomatic, direct, etc.)
   - **Risk** - How bold you want to be (safe, medium, bold)
   - **Length** - Target reply length (1-liner, 2-3 sentences, paragraph)
   - **CTA** - Whether to include a call-to-action
   - **Persona** - Your professional voice (builder, designer, PM, etc.)
3. Click "Generate Replies"
4. Browse the reply ladder (Safe → Interesting → Bold)
5. Copy the reply you like

### API

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "postText": "Shipping fast is less about speed and more about removing hidden approval steps.",
    "vibe": "nerdy",
    "risk": "medium",
    "length": "two-three"
  }'
```

See [API.md](./docs/API.md) for complete API documentation.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **AI:** OpenAI API (GPT-4)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Validation:** Zod
- **Deployment:** Vercel (recommended)

## Project Structure

```
notcringe/
├── app/                  # Next.js App Router
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout
│   └── api/              # API routes
│       └── generate/     # Reply generation endpoint
├── components/           # React components
│   ├── demo-generator.tsx
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities
│   ├── utils.ts
│   └── prisma.ts         # Prisma client
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── docs/                 # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
└── PRD.md                # Product requirements
```

## Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio GUI

# Utilities
npm run prisma           # Run Prisma CLI commands
```

## Documentation

- **[Product Requirements (PRD)](./PRD.md)** - Product vision and requirements
- **[API Documentation](./docs/API.md)** - API endpoints and schemas
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical decisions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup and development workflow
- **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute
- **[Deployment](./docs/DEPLOYMENT.md)** - Deploy to production

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for:

- Code of conduct
- Development setup
- Coding standards
- Pull request process

### Quick Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add voice profiles"`
5. Push and create a Pull Request

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fnotcringe)

Or manually:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
4. Deploy

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions and other platforms.

## Roadmap

### MVP (Current)

- [x] Reply generation API
- [x] Reply ladder (Safe/Interesting/Bold)
- [x] Vibe, risk, length controls
- [x] Web app UI
- [x] Safety filters

### Next

- [ ] Browser extension (Chrome, Firefox)
- [ ] Voice profile customization
- [ ] Feedback loop (worked/cringe/long)
- [ ] Saved posts library
- [ ] Follow-up reply generation
- [ ] Rate limiting

### Future

- [ ] Multi-language support
- [ ] Team workspaces
- [ ] Analytics dashboard
- [ ] Mobile app (PWA)
- [ ] API for developers

## Performance

- **API Latency:** < 4s (P50), < 6s (P95)
- **Uptime:** 99.5% target
- **Reply Quality:** Ranked by specificity, value-add, tone-fit

## Security

- Input validation with Zod
- Safety filters for harassment, hate speech
- Rate limiting (planned)
- PostgreSQL prepared statements (via Prisma)

## License

[MIT License](./LICENSE) (or your chosen license)

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/notcringe/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/notcringe/discussions)
- **Email:** support@notcringe.com (if applicable)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [OpenAI](https://openai.com)
- Database ORM by [Prisma](https://www.prisma.io)

---

Made with 💜 by the notCringe team

**Stop being cringe. Start being noticed.**
