import OpenAI from "openai";
import { tavily } from "@tavily/core";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Initialize Tavily for real-time web search
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

export async function discoverTrendingNeeds(category: string = "general"): Promise<string> {
  // Search multiple sources for trending pain points and unmet needs
  const searchQueries = [
    `"I wish there was" OR "I need help with" ${category} business 2026 site:reddit.com`,
    `trending business problems ${category} entrepreneurs struggling with 2026`,
    `${category} industry pain points what's missing market gap 2026`,
    `"looking for solution" OR "anyone know how to" ${category} business automation AI`,
  ];

  let allResults: Array<{ title: string; content: string; url: string }> = [];

  for (const query of searchQueries) {
    try {
      const searchResponse = await tvly.search(query, {
        searchDepth: "advanced",
        maxResults: 3,
      });
      allResults = allResults.concat(
        searchResponse.results.map((r: { title?: string; content?: string; url?: string }) => ({
          title: r.title || "Source",
          content: r.content || "",
          url: r.url || "N/A",
        }))
      );
    } catch (error) {
      console.error("Tavily search error for query:", query, error);
    }
  }

  if (allResults.length === 0) {
    return "Unable to fetch trend data. Please try again.";
  }

  // Format raw findings
  const rawFindings = allResults
    .map((r) => `**${r.title}**\n${r.content}\nSource: ${r.url}`)
    .join("\n\n---\n\n");

  // Use AI to analyze and synthesize the findings
  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a market research analyst specializing in identifying profitable business opportunities. Analyze online community discussions to find unmet needs that could be addressed with premium business guides/blueprints.

Focus on:
1. Pain points people are expressing
2. Questions being asked repeatedly
3. Gaps in existing solutions
4. Emerging trends and shifts
5. Underserved niches

Be specific and actionable. Each opportunity should be something that could become a sellable blueprint.`
      },
      {
        role: "user",
        content: `Analyze these online community discussions and search results to identify BUSINESS BLUEPRINT OPPORTUNITIES:

${rawFindings}

Provide your analysis in this format:

## Discovered Needs & Opportunities

### High-Demand Topics (Strong Blueprint Potential)
For each, include:
- **Topic**: [Specific topic name]
- **Pain Point**: [What problem are people facing?]
- **Evidence**: [Quote or summary from the research]
- **Blueprint Idea**: [What guide could solve this?]
- **Target Audience**: [Who would buy this?]
- **Estimated Tier**: [Starter/Growth/Enterprise]

### Emerging Trends to Watch
- [Trend 1]: [Why it matters]
- [Trend 2]: [Why it matters]

### Recommended Next Steps
1. [Specific action to validate these opportunities]
2. [Another action]

Identify at least 5 high-demand topics from the research.

IMPORTANT: At the very end, include a section exactly like this with 5-8 specific niche topics (these will become clickable buttons):

---NICHES---
[Niche 1 name - be specific, e.g., "AI-Powered Lead Generation for Real Estate"]
[Niche 2 name]
[Niche 3 name]
[Niche 4 name]
[Niche 5 name]
---END_NICHES---`
      }
    ],
    max_completion_tokens: 2048,
  });

  const analysis = analysisResponse.choices[0]?.message?.content || "";

  return `# Trend Discovery Report: ${category.charAt(0).toUpperCase() + category.slice(1)}

## Raw Community Intelligence

${rawFindings}

---

${analysis}

---

*Report generated using real-time community data from Reddit, forums, and industry sources.*`;
}

export async function businessInsiderIntelligence(industry: string, focusArea: string = "general"): Promise<string> {
  const searchQueries = [
    `${industry} industry report market size revenue growth 2025 2026`,
    `${industry} competitive landscape market leaders disruption startups 2026`,
    `${industry} ${focusArea} business strategy trends executive insights 2026`,
    `${industry} mergers acquisitions partnerships funding rounds 2026`,
    `${industry} regulatory changes technology adoption digital transformation 2026`,
    `${industry} consumer behavior shifts demand forecast emerging opportunities 2026`,
  ];

  let allResults: Array<{ title: string; content: string; url: string }> = [];

  for (const query of searchQueries) {
    try {
      const searchResponse = await tvly.search(query, {
        searchDepth: "advanced",
        maxResults: 4,
      });
      allResults = allResults.concat(
        searchResponse.results.map((r: { title?: string; content?: string; url?: string }) => ({
          title: r.title || "Source",
          content: r.content || "",
          url: r.url || "N/A",
        }))
      );
    } catch (error) {
      console.error("Tavily search error for BI query:", query, error);
    }
  }

  if (allResults.length === 0) {
    return "Unable to gather intelligence data. Please try again.";
  }

  const rawFindings = allResults
    .map((r) => `**${r.title}**\n${r.content}\nSource: ${r.url}`)
    .join("\n\n---\n\n");

  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: `You are a senior business intelligence analyst producing an executive briefing for a digital publishing platform. Your job is to synthesize real-time market data into a structured intelligence report that identifies actionable blueprint and content opportunities.

Write with the precision and authority of a Wall Street research analyst. Use real numbers, real company names, and specific data points wherever possible. Never use filler or speculation without labeling it as such.`
      },
      {
        role: "user",
        content: `Produce a comprehensive Business Insider Intelligence briefing for the **${industry}** industry${focusArea !== "general" ? `, with a focus on **${focusArea}**` : ""}.

Raw research data:

${rawFindings}

Structure your report as follows:

## Executive Summary
A 3-4 sentence overview of the most critical findings.

## Market Landscape
- Current market size and growth trajectory
- Key players and their market positions
- Recent shifts in competitive dynamics

## Disruption & Innovation Watch
- Emerging technologies or business models gaining traction
- Startups or newcomers challenging incumbents
- AI and automation impact on the industry

## Strategic Moves & Deal Flow
- Notable M&A activity, partnerships, or funding rounds
- Executive moves and leadership changes
- Regulatory developments that could reshape the market

## Consumer & Demand Intelligence
- Shifting consumer preferences or buyer behaviors
- Underserved segments or unmet demand signals
- Pricing trends and willingness-to-pay indicators

## Threat & Opportunity Matrix
| Category | Threat Level | Opportunity Level | Key Insight |
|----------|-------------|-------------------|-------------|
| [Area 1] | High/Med/Low | High/Med/Low | [Specific insight] |
| [Area 2] | ... | ... | ... |
(Include at least 5 rows)

## Blueprint Opportunities
For each opportunity, provide:
- **Topic**: Specific blueprint title
- **Why Now**: What makes this timely
- **Target Buyer**: Who would purchase this
- **Recommended Tier**: Starter/Growth/Enterprise
- **Revenue Potential**: Low/Medium/High
(Identify at least 5 opportunities)

## 30-Day Action Items
1. [Specific, time-bound action]
2. [Another action]
(At least 5 items)

IMPORTANT: At the very end, include a section exactly like this with 6-10 specific blueprint topics (these will become clickable buttons):

---NICHES---
[Niche 1 - be specific, e.g., "AI-Powered Supply Chain Optimization for Mid-Market Retailers"]
[Niche 2]
[Niche 3]
[Niche 4]
[Niche 5]
[Niche 6]
---END_NICHES---`
      }
    ],
    max_completion_tokens: 4096,
  });

  const analysis = analysisResponse.choices[0]?.message?.content || "";

  return `# Business Insider Intelligence: ${industry.charAt(0).toUpperCase() + industry.slice(1)}${focusArea !== "general" ? ` — ${focusArea}` : ""}

${analysis}

---

*Intelligence briefing generated using real-time market data from industry reports, news sources, and financial databases.*`;
}

export async function analyzeBusinessTrends(topic: string): Promise<string> {
  // Step 0: Fetch real-time trends using Tavily web search
  let webResearchContext = "";
  try {
    const searchResponse = await tvly.search(
      `latest trends and pain points for ${topic} business in 2026`,
      {
        searchDepth: "advanced",
        maxResults: 5,
      }
    );
    webResearchContext = searchResponse.results
      .map((r: { title?: string; content?: string; url?: string }) => 
        `**${r.title || "Source"}**\n${r.content || ""}\nSource: ${r.url || "N/A"}`
      )
      .join("\n\n---\n\n");
  } catch (error) {
    console.error("Tavily search error:", error);
    webResearchContext = "Unable to fetch real-time web data. Using AI analysis only.";
  }

  // Step 1: Summarize top threats and opportunities using web research (prompt chain step 1)
  const threatOpportunityResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a business trend analyst specializing in identifying market threats and opportunities. Be concise and specific. Base your analysis on the real-time research data provided.`
      },
      {
        role: "user",
        content: `For the niche: "${topic}"

Real-time Web Research (2026):
${webResearchContext}

Based on this research, summarize the TOP 5 THREATS and TOP 5 OPPORTUNITIES for 2026.

Format as:
## Top 5 Threats
1. [Threat]: [Brief explanation with data from research]
...

## Top 5 Opportunities  
1. [Opportunity]: [Brief explanation with data from research]
...

Be specific to this niche and cite findings from the research where possible.`
      }
    ],
    max_completion_tokens: 1024,
  });

  const threatOpportunityAnalysis = threatOpportunityResponse.choices[0]?.message?.content || "";

  // Step 2: Use the analysis to create actionable checklist (prompt chain step 2)
  const checklistResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a business strategist who creates practical, actionable checklists. Based on research about threats and opportunities, create implementation guides that businesses can execute immediately.`
      },
      {
        role: "user",
        content: `Based on this analysis for "${topic}":

${threatOpportunityAnalysis}

Create a 10-STEP ACTIONABLE CHECKLIST that businesses can implement to:
1. Mitigate the identified threats
2. Capitalize on the opportunities

Format as:
## 10-Step Action Checklist

### Immediate Actions (Week 1-2)
1. [Action]: [What to do, why it matters, expected outcome]
2. ...

### Short-term Actions (Month 1-3)
3. ...

### Medium-term Actions (Month 3-6)
...

### Long-term Strategic Actions (6+ months)
...

Make each step specific, measurable, and achievable.`
      }
    ],
    max_completion_tokens: 1536,
  });

  const actionableChecklist = checklistResponse.choices[0]?.message?.content || "";

  // Combine all outputs into comprehensive research
  return `# Business Research: ${topic}

## Real-Time Market Intelligence (2026)
${webResearchContext}

---

${threatOpportunityAnalysis}

---

${actionableChecklist}

---

*Research generated using Tavily web search + AI prompt chain methodology for maximum actionability.*`;
}

export async function generateBlueprintContent(topic: string, research: string, tier: "starter" | "growth" | "enterprise" = "growth"): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  // Map tier to level descriptor and depth
  const tierConfig = {
    starter: {
      level: "Beginner",
      wordCount: "3,000-4,000",
      complexity: "Step-by-step instructions for someone new to business. Include definitions and explanations.",
      pricing: "$29-49"
    },
    growth: {
      level: "Growth", 
      wordCount: "5,000-7,000",
      complexity: "Intermediate strategies with advanced tactics. Assume basic business knowledge.",
      pricing: "$79-149"
    },
    enterprise: {
      level: "Enterprise",
      wordCount: "8,000-12,000",
      complexity: "Executive-level strategic frameworks. Include governance, risk management, and board-level considerations.",
      pricing: "$199-499"
    },
    painpoints: {
      level: "Pain Points",
      wordCount: "4,000-6,000",
      complexity: "Identify and solve critical business pain points. Focus on common frustrations, root causes, and practical solutions with actionable remedies.",
      pricing: "$49-99"
    },
    ethicalhacks: {
      level: "Ethical Hacks",
      wordCount: "3,000-5,000",
      complexity: "Smart, ethical shortcuts and creative strategies that give businesses an edge. Focus on lesser-known tactics, growth hacks, and innovative approaches that are effective yet responsible.",
      pricing: "$39-79"
    },
    trendingusecases: {
      level: "Trending Use Cases",
      wordCount: "4,000-6,000",
      complexity: "Explore emerging trends and hot use cases gaining traction in the market. Focus on real-world examples, early adopter advantages, and how to capitalize on current momentum.",
      pricing: "$49-99"
    }
  }[tier];

  const systemPrompt = `### ROLE
You are a world-class business strategist, management consultant, and technical writer producing a premium deliverable for "AI Blueprint Pulse." This blueprint is a PAID product (${tierConfig.pricing}) that competes with McKinsey-style reports and top-tier business courses. Your reputation depends on every document being publication-ready.

### ABSOLUTE QUALITY RULES
These are non-negotiable. Violating any of them constitutes a failed output.

1. **NO FILLER**: Never pad content with generic business advice. Every sentence must contain a specific insight, number, tool name, tactic, or instruction tied directly to "${topic}". Delete any sentence that could apply to "any business."
2. **NO AI TELLS**: Never write "As an AI," "In today's rapidly evolving landscape," "In conclusion," "It's worth noting," "Key takeaways," or any similar stock phrases. Write like a senior consultant presenting to a board.
3. **SPECIFICITY OVER GENERALITY**: Instead of "use social media marketing," write "Run a 14-day Instagram Reels campaign targeting #[specific hashtag] with $15/day spend, optimizing for link clicks using Meta Ads Manager's Advantage+ placements." Every recommendation must pass the "Could someone execute this in the next hour?" test.
4. **REAL NAMES AND NUMBERS**: Reference real tools by name (with pricing), real platforms, real metrics, and realistic financial projections grounded in the research data provided. Do not invent statistics — qualify estimates clearly.
5. **PROFESSIONAL PROSE**: Write in polished, concise paragraphs — not walls of bullet points. Use bullets only for checklists, step sequences, and quick-reference lists. Substantive analysis belongs in paragraph form.
6. **LOGICAL FLOW**: Each section must build on the previous one. The executive summary sets up the market analysis, which justifies the roadmap, which determines the tech stack, which enables the templates.
7. **DEPTH OVER BREADTH**: It is better to thoroughly cover 5 strategies than to superficially list 15. Go deep on implementation details, edge cases, and contingency plans.

### TARGET AUDIENCE
${tierConfig.level} level: ${tierConfig.complexity}

### OUTPUT LENGTH
Generate ${tierConfig.wordCount} words of substantive content. Every section must have meaningful depth. Thin sections are unacceptable.

### WRITING STANDARDS
- **Voice**: Authoritative, direct, confident. Write as if billing $500/hour for this advice.
- **Evidence**: Ground every claim in the research data provided. Cite specific findings, trends, and data points.
- **Transitions**: Use smooth transitions between sections. No abrupt jumps.
- **Formatting**: Use Markdown headings (##, ###, ####) consistently. Use bold for key terms and emphasis. Use tables for comparative data. Use numbered lists for sequential steps.
- **Templates**: All templates and frameworks must be complete and ready to use — not placeholders or outlines.

### OUTPUT STRUCTURE (JSON with Markdown content)
Return a JSON object. The "content" field must contain the COMPLETE blueprint in Markdown following this structure:

## [TRENDING LONG-TAIL KEYWORD TITLE — SEO-optimized, 8-14 words, incorporating high-search-volume long-tail keywords that people actually search for. Example: "How to Build a Profitable Dropshipping Business with AI Automation in 2026" NOT generic titles like "Business Success Guide"]
*[One-sentence value proposition that makes the reader feel this was written specifically for them]*

### 1. Executive Summary
2-3 paragraphs (not bullets) covering: the specific opportunity, who should use this blueprint, what results they can realistically expect, and why acting now matters. Reference specific data from the research.

### 2. Market Landscape & Strategic Opportunity

#### 2.1 Market Gap Analysis
Identify the specific unmet need in paragraph form. Quantify the gap with data. Explain why current solutions fail.

#### 2.2 Revenue Model & Financial Projections
Detail the primary revenue stream with specific pricing recommendations. Include secondary revenue opportunities. Provide realistic Year 1/2/3 projections with assumptions stated clearly.

#### 2.3 Competitive Positioning
Name real competitors or competitor categories. Analyze their specific weaknesses. Define a clear differentiation strategy with positioning statement.

### 3. 90-Day Implementation Roadmap

#### Phase 1: Foundation (Days 1-30)
Break down into weekly goals. Each week should have:
- 3-5 specific daily/multi-day tasks with exact instructions
- Tools needed for each task (by name)
- Success metric for the week (quantified)
- Budget required for this phase
- Common mistakes to avoid this week

#### Phase 2: Growth (Days 31-60)
Same level of granularity as Phase 1.

#### Phase 3: Scale & Optimize (Days 61-90)
Same level of granularity. Include decision trees for what to do based on Phase 1-2 results.

### 4. Technology Stack & Setup Guides
For each recommended tool (minimum 5):
- **Name & URL**: What it is
- **Why this tool specifically**: Not "it's popular" — explain the specific capability needed
- **Setup walkthrough**: Numbered steps to go from signup to operational
- **Monthly cost**: Exact pricing tier recommended
- **Integration notes**: How it connects to other tools in this stack
- **Alternative**: One backup option if this tool doesn't fit

### 5. Ready-to-Use Templates & Frameworks
Provide at minimum 3 complete, filled-in templates (not empty shells). Examples:
- Email sequences with actual subject lines and body copy
- Financial projection spreadsheet structures with formulas described
- Decision matrices with criteria and scoring
- Pitch scripts or sales scripts with word-for-word language
- SOPs with step-by-step procedures

### 6. Key Performance Indicators

Present as a Markdown table with these columns:
| KPI | How to Measure | 30-Day Target | 60-Day Target | 90-Day Target | Red Flag Threshold |
Include 6-8 KPIs specific to this business model. Below the table, explain in paragraph form how to set up tracking for each.

### 7. Scaling Strategy: Path to $1M+ ARR
Cover in substantive paragraphs:
- When to hire and what roles (with salary ranges)
- Systems and automations to build before scaling
- Partnership and channel strategies with outreach templates
- Capital requirements and funding options with pros/cons
- Key inflection points and how to recognize them

### 8. Risk Management & Common Pitfalls
For each pitfall (minimum 6):
- **The Pitfall**: Specific description of what goes wrong
- **Why It Happens**: Root cause analysis
- **Prevention Strategy**: Exact steps to avoid it
- **Recovery Plan**: What to do if it happens anyway

### 9. 60-Minute Quick-Start Checklist
5-7 actions someone can take RIGHT NOW, each with:
- [ ] **Action**: Exact instruction
- **Time needed**: Realistic estimate
- **Expected outcome**: What they'll have when done
- **Tool/resource needed**: Specific link or resource

### 10. Recommended Resources & Next Steps
- 3-5 specific books, courses, or podcasts (by title and author)
- 2-3 communities or networks to join (by name with URLs where possible)
- Summary of all tools mentioned (consolidated reference list)
- Suggested 6-month and 12-month milestones beyond this blueprint

---
*Blueprint generated by AI Blueprint Pulse | Multi-Model AI Research | Full Resale Rights Included*`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `**Audience Level**: ${tierConfig.level}
**Topic**: ${topic}
**Minimum Length**: ${tierConfig.wordCount} words of substantive content

### Multi-Model Research Intelligence
The following research was compiled by 5 independent AI models (ChatGPT, Claude, Gemini, Grok, Perplexity) and synthesized for maximum accuracy:

${research}

### Your Task
Write the complete blueprint for "${topic}" using the structure defined in your instructions. This is a paid product — a customer is spending real money on this.

**Quality checklist before you finalize:**
- [ ] Every section has multiple paragraphs of substance (no thin sections)
- [ ] All tool recommendations include real names, real pricing, and setup steps
- [ ] Financial projections are grounded in the research data with assumptions stated
- [ ] Templates are complete and ready to use, not empty shells or placeholders
- [ ] The 90-day roadmap has specific daily/weekly tasks, not vague goals
- [ ] No generic filler sentences that could apply to any business
- [ ] No AI-style phrases ("In today's landscape," "Key takeaways," etc.)
- [ ] Smooth transitions between all sections
- [ ] KPI table includes how to measure each metric, not just targets`
      }
    ],
    max_completion_tokens: 16384,
    temperature: 0.4,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "blueprint",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "A trending, SEO-optimized long-tail keyword title (8-14 words). Must include high-search-volume keywords people actually Google. Format: 'How to [Achieve Result] with [Method/Tool] for [Audience/Niche] in [Year]' or similar long-tail patterns. Example: 'How to Scale a SaaS Business to $1M ARR Using AI-Powered Marketing in 2026'. Never use generic titles."
            },
            description: {
              type: "string", 
              description: "A one-sentence value proposition for marketing"
            },
            content: {
              type: "string",
              description: "The full blueprint in Markdown format with all 5 sections"
            },
            strategicOpportunity: {
              type: "string",
              description: "Section 1: The market gap and revenue lever"
            },
            implementationRoadmap: {
              type: "string",
              description: "Section 2: The 30/60/90 day implementation phases"
            },
            techStack: {
              type: "string",
              description: "Section 3: The 3-4 recommended tools for 2026"
            },
            xFactor: {
              type: "string",
              description: "Section 4: The enterprise scaling strategy"
            },
            immediateAction: {
              type: "string",
              description: "Section 5: The 60-minute action item"
            }
          },
          required: ["title", "description", "content", "strategicOpportunity", "implementationRoadmap", "techStack", "xFactor", "immediateAction"],
          additionalProperties: false
        }
      }
    },
  });

  const content = response.choices[0]?.message?.content || "{}";
  
  let title: string;
  let description: string;
  let blueprintContent: string;

  try {
    const parsed = JSON.parse(content);
    title = parsed.title || `Blueprint: ${topic}`;
    description = parsed.description || `Comprehensive guide for ${topic}`;
    blueprintContent = parsed.content || content;
  } catch {
    title = `Blueprint: ${topic}`;
    description = `Comprehensive guide for ${topic}`;
    blueprintContent = content;
  }

  const reviewed = await qualityReviewPass(blueprintContent, topic, tierConfig.level);

  return { title, description, content: reviewed };
}

export async function generateAgentScript(blueprintTitle: string, blueprintContent: string, topic: string, tier: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_completion_tokens: 12000,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `### ROLE
You are a senior AI solutions architect and automation engineer. You translate business blueprints into detailed, step-by-step agent implementation scripts. Your output is a practical technical guide that enables someone to build an AI agent (or multi-agent system) that executes the strategies described in the blueprint.

### OUTPUT REQUIREMENTS
Produce a comprehensive implementation guide in Markdown format with these sections:

## Agent Overview
- Agent name, purpose, and scope
- What business outcomes it automates from the blueprint
- Target platform(s) and deployment model

## Architecture
- Agent type (single agent, multi-agent, RAG-augmented, tool-using, etc.)
- Component diagram described in text
- Data flow between components
- External integrations required (APIs, databases, services)

## Tech Stack
- Specific frameworks and libraries with versions (e.g., LangChain, CrewAI, AutoGen, n8n, Make.com)
- LLM provider and model recommendations with reasoning
- Database/vector store choices
- Hosting and deployment platform

## Step-by-Step Implementation
Number every step. Each step must include:
1. What to build (specific component or module)
2. Code snippets or pseudocode where helpful
3. Configuration details (environment variables, API keys needed)
4. Testing criteria for that step

## Prompt Templates
- System prompts for each agent role
- User prompt templates for key interactions
- Few-shot examples where appropriate

## Automation Workflows
- Trigger conditions (scheduled, event-driven, user-initiated)
- Decision logic and branching
- Error handling and fallback strategies
- Human-in-the-loop checkpoints

## Deployment Checklist
- Environment setup steps
- Security considerations
- Monitoring and logging setup
- Cost estimation for API calls and infrastructure

## Scaling Strategy
- How to handle increased load
- Multi-tenant considerations if applicable
- Performance optimization tips

### QUALITY RULES
1. Every recommendation must reference a specific strategy or section from the source blueprint
2. Use real tool names, real API endpoints, real pricing where known
3. Code snippets must be functional, not pseudocode placeholders
4. Include estimated time for each implementation step
5. Write for a technical audience comfortable with Python/JavaScript and API integrations
6. No filler, no generic advice — every paragraph must be actionable`
      },
      {
        role: "user",
        content: `Generate a complete AI agent implementation script for the following blueprint.

**Blueprint Title**: ${blueprintTitle}
**Topic**: ${topic}
**Tier**: ${tier}

**Blueprint Content**:
${blueprintContent.slice(0, 15000)}`
      }
    ],
  });

  const script = response.choices[0]?.message?.content;
  if (!script) {
    throw new Error("Failed to generate agent script — empty response from AI");
  }
  return script;
}

async function qualityReviewPass(blueprint: string, topic: string, level: string): Promise<string> {
  try {
    const reviewer = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "placeholder",
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    });

    const reviewResponse = await reviewer.chat.completions.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a senior editorial director at a premium business publishing house. Your job is to review and polish a business blueprint to publication-ready quality. You receive a draft and return an improved version.

### YOUR EDITORIAL MANDATE
1. **Remove all AI-style filler**: Delete or rewrite any sentences containing phrases like "In today's rapidly evolving landscape," "It's worth noting," "Key takeaways," "In conclusion," "This comprehensive guide," "leverage," "synergy," "cutting-edge," "game-changer," or any cliche business jargon. Replace with direct, specific language.
2. **Strengthen weak sections**: If any section is thin (fewer than 2 substantive paragraphs), expand it with specific, actionable detail relevant to "${topic}".
3. **Fix vague recommendations**: Any recommendation that says "consider using" or "explore options for" must be replaced with a specific tool, tactic, or step.
4. **Verify logical flow**: Ensure each section builds on the previous one and transitions are smooth.
5. **Polish prose**: Fix awkward phrasing, improve sentence variety, and ensure consistent professional tone throughout.
6. **Ensure completeness**: All templates must be filled in (not placeholder text). All tables must have real data. All checklists must have specific actions.

### RULES
- Return ONLY the improved Markdown content. No commentary, no meta-text, no "Here's the improved version."
- Preserve all Markdown formatting (headings, bold, tables, lists, code blocks).
- Do NOT add new sections or change the overall structure — only improve the quality of what exists.
- Do NOT shorten the document. Maintain or increase its length by adding depth where sections are thin.
- The output audience is ${level} level.`
        },
        {
          role: "user",
          content: blueprint
        }
      ],
    });

    const reviewed = reviewResponse.choices[0]?.message?.content;
    if (reviewed && reviewed.length > blueprint.length * 0.5) {
      return reviewed;
    }
    return blueprint;
  } catch (error) {
    console.error("[QualityReview] Review pass failed, using original:", error instanceof Error ? error.message : error);
    return blueprint;
  }
}
