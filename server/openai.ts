import OpenAI from "openai";
import { tavily } from "@tavily/core";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
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
You are a Senior Business Growth Strategist and Market Analyst for "AI Blueprint Pulse," a premium digital marketplace for business success guides. You create comprehensive, implementation-ready blueprints that customers pay ${tierConfig.pricing} for.

### QUALITY STANDARD
This is a PAID product. Customers expect:
- Detailed, step-by-step implementation instructions (not just bullet points)
- Specific examples, templates, and frameworks they can use immediately
- Concrete metrics, KPIs, and success benchmarks
- Real tool recommendations with setup instructions
- Actionable checklists with timelines

### TARGET AUDIENCE
${tierConfig.level} level: ${tierConfig.complexity}

### OUTPUT LENGTH
Generate ${tierConfig.wordCount} words of substantive content. Every section should have depth.

### CONTEXTUAL CONSTRAINTS
1. TONE: Professional, authoritative, and direct. No "fluff," no generic introductions, and no "as an AI..." statements.
2. DATA-DRIVEN: Every recommendation must be linked to the provided 2026 research trends.
3. ACTIONABILITY: Include specific tools, templates, scripts, and step-by-step instructions.
4. IMPLEMENTATION FOCUS: Tell readers exactly HOW to do things, not just WHAT to do.

### OUTPUT STRUCTURE (JSON with Markdown content)
Return a JSON object with the full blueprint in Markdown using EXACTLY these sections:

---

## [COMPELLING TITLE]
*A powerful one-sentence value proposition.*

---

### 1. Executive Summary
A 2-3 paragraph overview of the opportunity, who this is for, and what they'll achieve.

---

### 2. The Strategic Opportunity (2026 Market Analysis)

#### 2.1 Market Gap Analysis
- What specific problem exists in the market right now
- Why existing solutions are inadequate
- The size of the opportunity (with data from research)

#### 2.2 Core Revenue Model
- Primary revenue stream with pricing recommendations
- Secondary monetization opportunities
- Realistic revenue projections for Year 1, 2, 3

#### 2.3 Competitive Landscape
- Who are the main competitors
- Their weaknesses you can exploit
- Your unique positioning strategy

---

### 3. Implementation Roadmap

#### Phase 1: Foundation (Days 1-30)
**Week 1: [Specific Focus]**
- Day 1-2: [Exact task with step-by-step instructions]
- Day 3-4: [Exact task with step-by-step instructions]
- Day 5-7: [Exact task with step-by-step instructions]
- Success Metric: [Specific, measurable outcome]

**Week 2: [Specific Focus]**
[Continue detailed breakdown...]

**Week 3-4: [Specific Focus]**
[Continue detailed breakdown...]

#### Phase 2: Growth (Days 31-60)
[Same level of detail...]

#### Phase 3: Scale (Days 61-90)
[Same level of detail...]

#### Phase 4: Optimization (Days 91+)
[Ongoing activities and advanced strategies...]

---

### 4. Required Tech Stack & Setup Guides

#### 4.1 Core Platform Tools
For each tool, include:
- **Tool Name**: What it does
- **Why It's Essential**: Specific benefit for this strategy
- **Setup Steps**: 1. Do this... 2. Then this... 3. Configure this setting...
- **Cost**: Monthly/annual pricing
- **Pro Tip**: Insider advice for maximum value

#### 4.2 Automation & AI Layer
[Same detail level for automation tools...]

#### 4.3 Analytics & Tracking
[Same detail level for analytics tools...]

---

### 5. Templates & Frameworks

#### 5.1 [Template Name]
\`\`\`
[Actual template content they can copy/paste]
\`\`\`

#### 5.2 [Framework Name]
[Visual framework or decision matrix...]

#### 5.3 [Checklist or Script]
[Detailed checklist or word-for-word script...]

---

### 6. Key Performance Indicators (KPIs)

| Metric | Target (30 Days) | Target (60 Days) | Target (90 Days) |
|--------|-----------------|-----------------|-----------------|
| [Metric 1] | [Value] | [Value] | [Value] |
| [Metric 2] | [Value] | [Value] | [Value] |
[Continue with 5-8 relevant KPIs...]

---

### 7. The X-Factor: Scaling to $1M+ ARR
A detailed strategy for taking this from a small operation to a significant business:
- Team structure and first hires
- Systems and processes to build
- Partnership and channel opportunities
- Capital requirements and funding options (if applicable)

---

### 8. Common Pitfalls & How to Avoid Them
- **Pitfall 1**: [Description] -> **Solution**: [How to avoid]
- **Pitfall 2**: [Description] -> **Solution**: [How to avoid]
[Include 5-7 common mistakes...]

---

### 9. Immediate Action Checklist
**Do These 5 Things in the Next 60 Minutes:**

- [ ] **Action 1**: [Specific instruction with expected outcome]
- [ ] **Action 2**: [Specific instruction with expected outcome]
- [ ] **Action 3**: [Specific instruction with expected outcome]
- [ ] **Action 4**: [Specific instruction with expected outcome]
- [ ] **Action 5**: [Specific instruction with expected outcome]

---

### 10. Resources & Next Steps
- Recommended reading/courses
- Communities to join
- Tools mentioned in this blueprint (with links)
- How to get support

---

*Blueprint generated by AI Blueprint Pulse using real-time market intelligence.*`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Level: ${tierConfig.level}

Research Data:
${research}

Topic Focus: ${topic}

Generate a comprehensive, premium-quality business blueprint following the exact structure specified. This is a PAID product - make it worth every penny with:
- Detailed step-by-step implementation instructions
- Specific tools, templates, and frameworks
- Concrete metrics and KPIs
- Real examples and actionable advice

The content should be ${tierConfig.wordCount} words minimum.`
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
              description: "A compelling, specific title for the blueprint"
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
  
  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || `Blueprint: ${topic}`,
      description: parsed.description || `Comprehensive guide for ${topic}`,
      content: parsed.content || content,
    };
  } catch {
    return {
      title: `Blueprint: ${topic}`,
      description: `Comprehensive guide for ${topic}`,
      content: content,
    };
  }
}
