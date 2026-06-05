# AI Blueprint Pulse

A full-stack SaaS marketplace for AI-generated business success guides, powered by multi-model AI research across 5 large language models.

**Live site:** [aiblueprintpulse.com](https://aiblueprintpulse.com)

---

## What It Does

AI Blueprint Pulse lets entrepreneurs and business owners browse, purchase, and download actionable business blueprints. Administrators can use built-in AI tools to research market trends and generate new blueprint content. Users can also generate their own custom blueprints in the Blueprint Studio using a credit-based system.

---

## Features

### Public Marketplace
- Browse blueprints by tier: Free, Starter, Growth, Enterprise, Pain Points
- Filter by category (15 categories), sort by newest or price
- Stripe-powered checkout for paid blueprints
- PDF download for purchased content

### Blueprint Studio (Credit-Based)
- Purchase credit packages via Stripe ($10 / $40 / $75)
- Generate custom blueprints using 5-model AI research
- Download generated blueprints as branded DOCX Word files with resale rights
- Generate AI agent implementation scripts from any blueprint
- Topic discovery and multi-model analysis tools

### Multi-Model AI Engine
Every generation runs across 5 AI models in parallel:
- **GPT-4.1** — OpenAI
- **Claude Sonnet** — Anthropic
- **Gemini 2.5 Flash** — Google
- **Grok 3 Mini** — xAI (via OpenRouter)
- **Llama 3.1 Sonar** — Perplexity (live web search)

A Claude-powered quality review pass runs after generation to enforce professional writing standards.

### Public Blog
- AI-generated articles using Tavily research + GPT-4.1
- Category filtering, markdown rendering, SEO-optimized post pages

### Free Resources
- Downloadable PDF guides (YouTube Success Guide, AI Agentic Workflow Guide)
- Generated with PDFKit, cached in memory for fast delivery

### Admin Dashboard (7 Tabs)
1. **Research & Generate** — Tavily-powered niche research → blueprint generation → publish to marketplace
2. **Pain Point Discovery** — YouTube comment analysis (search by topic or paste URL) to extract business pain points and opportunities
3. **Business Insider Intelligence** — Executive briefings across 24 industry verticals with market sizing, competitive landscape, M&A tracking, and more
4. **Blog Manager** — AI-generate, edit, publish, and manage blog posts
5. **Nexus Status** — Monitor external research jobs via n8n webhook integration
6. **Analytics** — PDF download tracking per blueprint
7. **Blueprint Management** — Edit and manage all marketplace blueprints

### SEO Infrastructure
- Dynamic `sitemap.xml` including all blueprints and published blog posts
- `robots.txt` with AI crawler directives
- Structured data (JSON-LD) on every public page: Organization, WebSite, SoftwareApplication, FAQPage, Article, BreadcrumbList, Product schemas
- Unique meta titles, descriptions, Open Graph, and Twitter Card tags per page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth (OpenID Connect + Passport.js) |
| Payments | Stripe Checkout |
| AI | OpenAI, Anthropic, Google Gemini, OpenRouter, Perplexity |
| Research | Tavily Web Search API |
| Email | Resend |
| PDF | PDFKit |
| DOCX | docx |
| External Workflows | n8n webhook |

---

## Project Structure

```
├── client/src/
│   ├── pages/          # Route pages (landing, marketplace, studio, blog, etc.)
│   ├── components/     # Shared UI components (navbar, blueprint-card, seo, etc.)
│   └── hooks/          # Custom React hooks
├── server/
│   ├── routes.ts       # All API endpoints
│   ├── storage.ts      # Database access layer (IStorage interface)
│   ├── openai.ts       # AI generation functions (blueprints, blog, BI intelligence)
│   ├── multiModelService.ts  # 5-model parallel analysis
│   ├── pdfGuideService.ts    # PDF guide generation
│   └── docxService.ts        # DOCX export
└── shared/
    └── schema.ts       # Drizzle schema + Zod types shared between client and server
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session secret |
| `PERPLEXITY_API_KEY` | Perplexity AI API key |
| `TAVILY_API_KEY` | Tavily web search API key |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `N8N_API_KEY` | n8n webhook authentication |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint |

OpenAI, Anthropic, Gemini, and OpenRouter are connected via Replit AI Integrations.
Stripe and Resend are connected via Replit Connectors.

---

## Running Locally

```bash
npm install
npm run db:push   # sync database schema
npm run dev       # starts Express + Vite on the same port
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `blueprints` | Marketplace blueprint catalog |
| `purchases` | User purchase records |
| `users` | User accounts |
| `sessions` | Session storage |
| `blog_posts` | Blog content |
| `generated_blueprints` | Studio-generated blueprints |
| `blueprint_credits` | User credit balances |
| `credit_transactions` | Credit purchase/spend history |
| `research_sessions` | Admin research tool sessions |
| `nexus_jobs` | n8n external research job tracking |
