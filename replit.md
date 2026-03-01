# AI Blueprint Pulse

## Overview

AI Blueprint Pulse is a SaaS digital marketplace for marketing and selling business success guides. Users can browse, purchase, and download actionable business blueprints organized by tier (Starter, Growth, Enterprise). The platform includes AI-powered research tools for administrators to generate new blueprint content, Stripe payment integration, and Replit authentication.

**Design Theme**: Fintech-inspired aesthetic with deep navy primary colors and clean white backgrounds using Inter typography.

## Recent Changes (March 2026)
- Agent Implementation Scripts
  - Generate AI agent implementation scripts from any created blueprint
  - GPT-4.1-powered script generation with architecture, tech stack, step-by-step implementation, prompt templates, automation workflows, deployment checklist
  - Agent scripts stored in `agent_script` column on `generated_blueprints` table
  - DOCX download support for agent scripts via docxService
  - API endpoints: POST /api/studio/blueprints/:id/agent-script, GET /api/studio/blueprints/:id/agent-script/download
  - UI: "Agent" button on blueprint cards in My Blueprints tab and Generate preview, inline viewer with DOCX download

## Previous Changes (February 2026)
- Blueprint Quality Improvements
  - Enhanced generation prompt with strict no-filler rules, anti-AI-tells, specificity requirements, professional prose standards
  - Added Claude-powered post-generation quality review pass (qualityReviewPass in server/openai.ts)
  - Upgraded DOCX service with proper Markdown table rendering, code blocks, checkboxes, nested lists, branded headers/footers, page numbers
  - Added OIDC auth retry logic with graceful server startup fallback when auth service is temporarily unavailable
- Added Multi-Model AI Analysis (ChatGPT + Claude + Gemini + Grok + Perplexity)
  - server/multiModelService.ts: queries all 5 AI models in parallel, synthesizes results
  - Blueprint Studio generation now uses multi-model research before generating content
  - New API endpoint: POST /api/studio/multi-analyze for standalone multi-model topic analysis
  - Studio Analyze tab: "Quick Analyze" (single model) and "Multi-Model Analysis" (5 models) buttons
  - Landing page updated to highlight 5-model AI feature in hero, features, trust badges, and FAQ
  - AI providers: OpenAI (gpt-4.1), Anthropic (claude-sonnet-4-5), Gemini (gemini-2.5-flash), OpenRouter (x-ai/grok-3-mini-beta), Perplexity (llama-3.1-sonar-small-128k-online)
  - OpenAI/Anthropic/Gemini/OpenRouter via Replit AI Integrations; Perplexity via PERPLEXITY_API_KEY secret
- Added Blueprint Studio (client-facing) at /studio
  - Credit-based system: users purchase credits (1/$10, 5/$40, 10/$75) via Stripe checkout
  - AI blueprint generation: users enter topic, tier, category to generate business guides
  - DOCX download: generated blueprints downloadable as Word documents with full resale rights
  - Discover & Analyze tabs: trending needs discovery and topic analysis (mirrors admin research tools)
  - My Blueprints tab: list of all generated blueprints with download buttons
  - Credits tab: balance display, purchase packages, transaction history
  - Database tables: blueprint_credits, credit_transactions, generated_blueprints
  - Security: userId verification on credit claims, credit refund on generation failure
  - API routes: /api/credits/*, /api/studio/*
- Built NexusResearchService: job tracking system for business research via n8n webhook
  - Database-backed job tracking with status flow: queued -> sending -> researching -> analyzing -> generating -> completed/failed/capacity
  - Retry logic (3 attempts) for 502/504 gateway errors with "System at Capacity" messaging
  - x-api-key header authentication on all n8n webhook requests
  - Callback endpoint (POST /api/nexus/callback) for n8n to update job status
  - Nexus Status dashboard in admin with progress bars, real-time polling, stage indicators, and job history
- Added YouTube Pain Point Discovery tool in admin dashboard
  - YouTube Data API v3 integration for video search and comment fetching
  - OpenAI-powered analysis extracts business pain points, severity, frequency, and opportunities from comments
  - Two modes: paste video URL or search YouTube by topic
  - Results show severity breakdown, sample comments, and actionable business opportunities
- Added "Pain Points" tier to blueprint marketplace
- Added PDF download tracking with admin analytics dashboard
- Integrated n8n webhook for external blueprint research workflows
- Enhanced PDF markdown cleanup (H5/H6 headers, arrow notation, code blocks, tables)

## Previous Changes (January 2026)
- Completed full-stack implementation of marketplace, checkout, and admin features
- Implemented Stripe payment integration with checkout sessions
- Added OpenAI-powered research and blueprint generation tools
- Created 8 sample blueprints across all tiers
- Built user dashboard for purchased downloads
- Added dark/light theme toggle
- Integrated Resend email automation for post-purchase sequences

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **API Design**: RESTful endpoints under `/api/` prefix
- **Build Process**: esbuild for server bundling, Vite for client

### Database Schema
- **blueprints**: Core product table (title, description, content, tier, price, category)
- **purchases**: Tracks user purchases with Stripe payment references
- **researchSessions**: Admin AI research tool sessions
- **users**: User accounts (required for Replit Auth)
- **sessions**: Session storage (required for Replit Auth)
- **conversations/messages**: Chat functionality for AI features

### Authentication Flow
- Replit Auth handles login/logout via `/api/login` and `/api/logout`
- Session-based authentication with 1-week TTL
- Protected routes redirect unauthenticated users to login
- Admin detection based on user email or ID

### Payment Integration
- Stripe Checkout for purchases
- Webhook handling for payment completion (must be registered before `express.json()`)
- Uses `stripe-replit-sync` for managed webhook setup

### AI Integration
- OpenAI API via Replit AI Integrations for business trend analysis
- Blueprint content generation from research data
- Voice and image generation capabilities available via replit_integrations

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema defined in `shared/schema.ts`, migrations in `./migrations`

### Authentication
- **Replit Auth**: OpenID Connect provider at `https://replit.com/oidc`
- Required env vars: `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Payment Processing
- **Stripe**: Payment processing with Checkout Sessions
- Credentials fetched via Replit Connectors API
- Webhook endpoint: `/api/stripe/webhook`

### AI Services
- **OpenAI API**: Accessed via Replit AI Integrations
- Env vars: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Used for: business analysis, content generation, voice chat, image generation

### Third-Party Libraries
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **date-fns**: Date formatting
- **zod**: Schema validation
- **p-limit/p-retry**: Batch processing with rate limiting