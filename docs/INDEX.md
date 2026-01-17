# Documentation Index

Complete guide to notCringe documentation. Start here to find what you need.

## 📚 Quick Navigation

| I want to...                   | Read this                                  |
| ------------------------------ | ------------------------------------------ |
| Understand what notCringe does | [README](../README.md), [PRD](../PRD.md)   |
| Set up development environment | [DEVELOPMENT.md](./DEVELOPMENT.md)         |
| Use the API                    | [API.md](./API.md)                         |
| Understand the architecture    | [ARCHITECTURE.md](./ARCHITECTURE.md)       |
| Deploy to production           | [DEPLOYMENT.md](./DEPLOYMENT.md)           |
| Contribute code                | [CONTRIBUTING.md](./CONTRIBUTING.md)       |
| Fix an issue                   | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Learn about security           | [SECURITY.md](../SECURITY.md)              |
| See what's new                 | [CHANGELOG.md](../CHANGELOG.md)            |
| Find answers                   | [FAQ.md](./FAQ.md)                         |

---

## 📖 Core Documentation

### [README.md](../README.md)

**Start here!** Project overview, quick start, and high-level information.

**Contents:**

- What is notCringe?
- Key features
- Quick start guide
- Tech stack
- Project structure
- Scripts reference

**Audience:** Everyone

---

### [PRD.md](../PRD.md)

Product requirements document. The "why" behind notCringe.

**Contents:**

- Problem statement
- Goals and non-goals
- Target users and personas
- User journeys
- Feature specifications
- Success metrics
- Roadmap

**Audience:** Product managers, designers, stakeholders, new contributors

---

## 🛠️ Technical Documentation

### [ARCHITECTURE.md](./ARCHITECTURE.md)

System design and technical decisions.

**Contents:**

- System architecture diagram
- Tech stack rationale
- Directory structure deep dive
- Data flow diagrams
- Key components
- Reply generation algorithm
- Performance considerations
- Security architecture
- Scalability strategy

**Audience:** Developers, architects, technical contributors

**Read this if:**

- You want to understand how notCringe works internally
- You're making architectural decisions
- You're optimizing performance
- You're planning new features

---

### [API.md](./API.md)

Complete API reference documentation.

**Contents:**

- API endpoints
- Request/response schemas
- Authentication (future)
- Rate limits
- Error codes
- Examples with curl
- Safety filters
- Performance targets

**Audience:** API consumers, frontend developers, integrators

**Read this if:**

- You're calling the API
- You're building a client
- You need to understand request/response format

---

### [DEVELOPMENT.md](./DEVELOPMENT.md)

Comprehensive guide for local development.

**Contents:**

- Prerequisites and setup
- Development workflow
- Project structure explained
- Key concepts (Reply Ladder, prompting, etc.)
- Debugging techniques
- Testing strategies
- Performance optimization
- Common development tasks
- Tips and tricks

**Audience:** Developers working on the codebase

**Read this if:**

- You're setting up for the first time
- You want to understand the development process
- You need debugging help
- You're adding new features

---

## 🚀 Deployment & Operations

### [DEPLOYMENT.md](./DEPLOYMENT.md)

How to deploy notCringe to production.

**Contents:**

- Vercel deployment (recommended)
- Alternative platforms (Railway, DigitalOcean, Docker)
- Environment variables setup
- Database configuration
- Domain setup
- Monitoring and analytics
- Scaling strategies
- Security considerations
- Backup and recovery
- Deployment checklist

**Audience:** DevOps, platform engineers, project maintainers

**Read this if:**

- You're deploying to production
- You're setting up CI/CD
- You need to scale the application
- You're troubleshooting production issues

---

### [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Common issues and how to fix them.

**Contents:**

- Development issues
- Database connection problems
- API errors
- Deployment failures
- Performance issues
- Step-by-step solutions
- When and how to ask for help

**Audience:** Everyone

**Read this if:**

- Something isn't working
- You're getting errors
- The app is slow
- You're stuck

---

## 🤝 Contributing

### [CONTRIBUTING.md](./CONTRIBUTING.md)

Guidelines for contributing to notCringe.

**Contents:**

- Code of conduct
- Development setup
- Coding standards (TypeScript, React, naming)
- Git workflow (branches, commits)
- Testing requirements
- Pull request process
- Code review criteria
- Common contribution tasks

**Audience:** Open source contributors, community members

**Read this if:**

- You want to contribute code
- You want to understand our standards
- You're submitting a pull request
- You want to help improve notCringe

---

## 🔒 Security & Privacy

### [SECURITY.md](../SECURITY.md)

Security policy and vulnerability reporting.

**Contents:**

- Supported versions
- How to report vulnerabilities
- Security best practices
- Known security considerations
- Disclosure process
- Security hall of fame

**Audience:** Security researchers, concerned users

**Read this if:**

- You found a security issue
- You want to understand our security posture
- You're doing a security audit

---

## 📝 Reference

### [CHANGELOG.md](../CHANGELOG.md)

Version history and release notes.

**Contents:**

- All releases (chronological)
- Features added
- Bugs fixed
- Breaking changes
- Versioning strategy

**Audience:** Everyone tracking changes

**Read this if:**

- You want to know what's new
- You're upgrading versions
- You need to understand changes between versions

---

### [FAQ.md](./FAQ.md)

Frequently asked questions.

**Contents:**

- General questions (what, why, who)
- Product questions (features, usage)
- Technical questions (how it works)
- Development questions (contributing, bugs)
- Pricing questions (tiers, limits)
- Privacy & security questions

**Audience:** Everyone with questions

**Read this if:**

- You have a question
- You want quick answers
- You're new to notCringe

---

## 📁 Other Files

### `.env.example`

Template for environment variables.

**Contents:**

- Required variables (DATABASE_URL, OPENAI_API_KEY)
- Optional variables
- Comments explaining each

**Audience:** Developers setting up locally

**Use this:**

```bash
cp .env.example .env
# Then edit .env with your values
```

---

### `package.json`

NPM package configuration.

**Contents:**

- Dependencies
- Scripts
- Metadata

**Important scripts:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

---

## 🗺️ Documentation Map

```
notcringe/
├── README.md                 ← Start here
├── PRD.md                    ← Product vision
├── CHANGELOG.md              ← What's new
├── SECURITY.md               ← Security policy
├── .env.example              ← Environment template
│
└── docs/
    ├── INDEX.md              ← You are here!
    ├── ARCHITECTURE.md       ← System design
    ├── API.md                ← API reference
    ├── DEVELOPMENT.md        ← Dev guide
    ├── DEPLOYMENT.md         ← Deploy guide
    ├── CONTRIBUTING.md       ← How to contribute
    ├── TROUBLESHOOTING.md    ← Fix issues
    └── FAQ.md                ← Quick answers
```

---

## 🎯 Getting Started Paths

### I'm a User

1. [README](../README.md) - Understand what notCringe is
2. [FAQ](./FAQ.md) - Common questions
3. Visit the web app and try it!

### I'm a Developer (New)

1. [README](../README.md) - Overview
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup guide
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
4. [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

### I'm a Contributor

1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Standards and process
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
3. [API.md](./API.md) - If working on API
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When stuck

### I'm Deploying

1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Fix issues
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand system

### I'm Investigating Security

1. [SECURITY.md](../SECURITY.md) - Security policy
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Security architecture
3. Report vulnerabilities responsibly

---

## 📊 Documentation Status

| Document           | Status      | Last Updated |
| ------------------ | ----------- | ------------ |
| README.md          | ✅ Complete | 2026-01-17   |
| PRD.md             | ✅ Complete | 2026-01-17   |
| ARCHITECTURE.md    | ✅ Complete | 2026-01-17   |
| API.md             | ✅ Complete | 2026-01-17   |
| DEVELOPMENT.md     | ✅ Complete | 2026-01-17   |
| DEPLOYMENT.md      | ✅ Complete | 2026-01-17   |
| CONTRIBUTING.md    | ✅ Complete | 2026-01-17   |
| TROUBLESHOOTING.md | ✅ Complete | 2026-01-17   |
| FAQ.md             | ✅ Complete | 2026-01-17   |
| SECURITY.md        | ✅ Complete | 2026-01-17   |
| CHANGELOG.md       | ✅ Complete | 2026-01-17   |

---

## 🔄 Keeping Documentation Updated

Documentation should be updated when:

- **Features added** → Update API.md, DEVELOPMENT.md, CHANGELOG.md
- **Architecture changes** → Update ARCHITECTURE.md
- **New deployment target** → Update DEPLOYMENT.md
- **Common issues** → Update TROUBLESHOOTING.md, FAQ.md
- **Security changes** → Update SECURITY.md
- **Version released** → Update CHANGELOG.md
- **Process changes** → Update CONTRIBUTING.md

---

## 💡 Improving Documentation

Found an issue or want to improve docs?

1. **For typos/small fixes:**
   - Edit directly and submit PR

2. **For major changes:**
   - Open issue first to discuss
   - Then submit PR

3. **For new documentation:**
   - Propose in GitHub Discussions
   - Get feedback
   - Create and submit

See [CONTRIBUTING.md](./CONTRIBUTING.md) for process.

---

## 🆘 Still Can't Find What You Need?

- **Search:** Use GitHub's search (top of this page)
- **Ask:** [GitHub Discussions](https://github.com/your-org/notcringe/discussions)
- **Report:** [Open an issue](https://github.com/your-org/notcringe/issues/new)
- **Contact:** support@notcringe.com (if set up)

---

**Welcome to notCringe! We're glad you're here. 🎉**
