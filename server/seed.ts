import { db } from "./db";
import { blueprints } from "@shared/schema";

const sampleBlueprints = [
  {
    title: "Digital Marketing Foundations",
    description: "Master the essentials of digital marketing with this comprehensive guide. Learn SEO, social media, and content marketing strategies.",
    content: `# Digital Marketing Foundations

## Overview
This blueprint covers the essential strategies and tactics for building a strong digital marketing presence.

## Chapter 1: Search Engine Optimization (SEO)
- Keyword research fundamentals
- On-page optimization techniques
- Building quality backlinks
- Technical SEO best practices

## Chapter 2: Social Media Marketing
- Platform selection strategy
- Content calendar planning
- Engagement tactics
- Analytics and measurement

## Chapter 3: Content Marketing
- Content strategy development
- Writing compelling copy
- Visual content creation
- Distribution channels

## Action Items
1. Conduct a website SEO audit
2. Set up social media profiles
3. Create a 30-day content plan
4. Implement tracking and analytics`,
    tier: "starter" as const,
    price: 2900,
    category: "Marketing",
  },
  {
    title: "Sales Pipeline Optimization",
    description: "Transform your sales process with proven frameworks for lead generation, qualification, and closing deals at scale.",
    content: `# Sales Pipeline Optimization

## Overview
Build a systematic sales process that consistently converts leads into customers.

## Chapter 1: Lead Generation
- Inbound vs outbound strategies
- Lead magnet creation
- Landing page optimization
- Multi-channel prospecting

## Chapter 2: Lead Qualification
- BANT framework deep dive
- Scoring and prioritization
- CRM implementation
- Automation workflows

## Chapter 3: Closing Strategies
- Discovery call frameworks
- Objection handling playbook
- Proposal templates
- Follow-up sequences

## Templates Included
- Lead scoring matrix
- Discovery call script
- Proposal template
- Pipeline dashboard`,
    tier: "growth" as const,
    price: 7900,
    category: "Sales",
  },
  {
    title: "Enterprise Scaling Playbook",
    description: "Comprehensive guide for scaling operations from growth stage to enterprise level. Includes org structure, processes, and governance.",
    content: `# Enterprise Scaling Playbook

## Overview
Navigate the complex transition from growth stage to enterprise operations with confidence.

## Part 1: Organizational Design
### Leadership Structure
- C-suite composition and responsibilities
- VP and Director level frameworks
- Middle management development
- Individual contributor tracks

### Team Architecture
- Departmental boundaries
- Cross-functional collaboration models
- Communication hierarchies
- Decision-making frameworks

## Part 2: Process Engineering
### Operational Excellence
- Standard operating procedures
- Quality assurance frameworks
- Continuous improvement methodologies
- Performance metrics and KPIs

### Technology Infrastructure
- Enterprise system selection
- Integration architecture
- Data governance
- Security and compliance

## Part 3: Governance & Risk
### Corporate Governance
- Board structure and composition
- Committee frameworks
- Reporting requirements
- Stakeholder management

### Risk Management
- Enterprise risk assessment
- Mitigation strategies
- Business continuity planning
- Crisis management protocols

## Implementation Roadmap
Quarterly milestones for 18-month transformation`,
    tier: "enterprise" as const,
    price: 19900,
    category: "Strategy",
  },
  {
    title: "Product-Market Fit Guide",
    description: "Discover and validate product-market fit using lean methodology. Perfect for early-stage founders and product managers.",
    content: `# Finding Product-Market Fit

## The PMF Framework
This guide walks you through the systematic process of achieving product-market fit.

## Step 1: Customer Discovery
- Identifying target segments
- Interview techniques
- Problem validation
- Jobs-to-be-done framework

## Step 2: Solution Validation
- MVP development
- Prototype testing
- User feedback loops
- Iteration cycles

## Step 3: Measuring PMF
- The Sean Ellis test
- Cohort retention analysis
- NPS scoring
- Engagement metrics

## Templates
- Customer interview guide
- Problem-solution canvas
- MVP prioritization matrix`,
    tier: "starter" as const,
    price: 2900,
    category: "Strategy",
  },
  {
    title: "Revenue Operations Blueprint",
    description: "Align sales, marketing, and customer success teams with a unified revenue operations framework for predictable growth.",
    content: `# Revenue Operations Blueprint

## Introduction to RevOps
Unified revenue operations is the key to predictable, scalable growth.

## Module 1: Data Foundation
- Single source of truth
- Data quality management
- Attribution models
- Reporting infrastructure

## Module 2: Process Alignment
- Funnel standardization
- Handoff protocols
- SLA definitions
- Feedback loops

## Module 3: Technology Stack
- CRM optimization
- Marketing automation
- Sales enablement tools
- Analytics platforms

## Module 4: Team Structure
- RevOps roles and responsibilities
- Hiring profiles
- Training programs
- Performance management

## Implementation Guide
6-month rollout plan with weekly milestones`,
    tier: "growth" as const,
    price: 7900,
    category: "Operations",
  },
  {
    title: "Financial Modeling Masterclass",
    description: "Build robust financial models for fundraising, forecasting, and strategic planning. Includes Excel/Sheets templates.",
    content: `# Financial Modeling Masterclass

## Core Principles
Building financial models that investors and boards trust.

## Part 1: Revenue Modeling
- Top-down vs bottom-up approaches
- Cohort-based projections
- Pricing sensitivity analysis
- Scenario planning

## Part 2: Cost Structure
- Fixed vs variable costs
- Unit economics deep dive
- Burn rate management
- Path to profitability

## Part 3: Cash Flow Management
- Working capital optimization
- Cash conversion cycles
- Treasury management
- Runway calculations

## Part 4: Investor Presentations
- Metrics that matter
- Valuation methodologies
- Due diligence preparation
- Data room organization

## Templates Included
- 3-statement financial model
- Cap table template
- Scenario planning dashboard
- Investor deck outline`,
    tier: "growth" as const,
    price: 9900,
    category: "Finance",
  },
  {
    title: "Team Leadership Framework",
    description: "Develop high-performing teams with proven leadership techniques. From hiring to retention, culture to performance.",
    content: `# Team Leadership Framework

## Leadership Fundamentals
Building and leading teams that deliver exceptional results.

## Chapter 1: Hiring Excellence
- Job description optimization
- Structured interviewing
- Assessment frameworks
- Onboarding programs

## Chapter 2: Performance Management
- Goal setting (OKRs/SMART)
- Feedback frameworks
- 1-on-1 best practices
- Performance reviews

## Chapter 3: Culture Building
- Values definition
- Culture reinforcement
- Remote team management
- Conflict resolution

## Chapter 4: Retention Strategies
- Career development paths
- Compensation philosophy
- Recognition programs
- Exit interview insights

## Tools Included
- Interview scorecard
- 1-on-1 template
- Performance review framework
- Culture assessment survey`,
    tier: "starter" as const,
    price: 3900,
    category: "Leadership",
  },
  {
    title: "AI Implementation Roadmap",
    description: "Strategic guide for implementing AI and automation across your organization. From use case identification to deployment.",
    content: `# AI Implementation Roadmap

## AI Strategy Overview
Transform your organization with strategic AI implementation.

## Phase 1: Assessment
- AI readiness evaluation
- Use case identification
- Data infrastructure audit
- Skills gap analysis

## Phase 2: Pilot Projects
- Quick win identification
- Proof of concept development
- Success metrics definition
- Stakeholder alignment

## Phase 3: Scaling
- Production deployment
- Change management
- Training programs
- Governance frameworks

## Phase 4: Optimization
- Performance monitoring
- Continuous improvement
- ROI measurement
- Next-gen opportunities

## Use Case Library
- Customer service automation
- Sales intelligence
- Process optimization
- Predictive analytics`,
    tier: "enterprise" as const,
    price: 24900,
    category: "Technology",
  },
];

async function seed() {
  console.log("Seeding database with sample blueprints...");
  
  for (const blueprint of sampleBlueprints) {
    await db.insert(blueprints).values(blueprint);
    console.log(`Created: ${blueprint.title}`);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
