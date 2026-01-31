import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function analyzeBusinessTrends(topic: string): Promise<string> {
  // Step 1: Summarize top threats and opportunities (prompt chain step 1)
  const threatOpportunityResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a business trend analyst specializing in identifying market threats and opportunities. Be concise and specific.`
      },
      {
        role: "user",
        content: `For the niche: "${topic}"

Summarize the TOP 5 THREATS and TOP 5 OPPORTUNITIES for 2026.

Format as:
## Top 5 Threats
1. [Threat]: [Brief explanation]
...

## Top 5 Opportunities  
1. [Opportunity]: [Brief explanation]
...

Be specific to this niche and focus on actionable insights.`
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

  // Combine both outputs into comprehensive research
  return `# Business Research: ${topic}

${threatOpportunityAnalysis}

---

${actionableChecklist}

---

*Research generated using prompt chain methodology for maximum actionability.*`;
}

export async function generateBlueprintContent(topic: string, research: string, tier: "starter" | "growth" | "enterprise" = "growth"): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  // Map tier to level descriptor
  const tierLevel = {
    starter: "Beginner",
    growth: "Growth", 
    enterprise: "Enterprise"
  }[tier];

  const systemPrompt = `### ROLE
You are a Senior Business Growth Strategist and Market Analyst for "Blueprint Nexus." Your expertise lies in distilling complex market data into hyper-concise, high-signal, and actionable business blueprints for entrepreneurs ranging from beginners to enterprise leaders.

### CONTEXT
The user will provide you with raw "Research Trends" and a "Target Business Level." Your task is to synthesize this data into a "Business Success Blueprint" that follows a rigid, professional structure.

### CONTEXTUAL CONSTRAINTS
1. TONE: Professional, authoritative, and direct. No "fluff," no generic introductions, and no "as an AI..." statements.
2. DATA-DRIVEN: Every recommendation must be linked to the provided 2026 research trends.
3. ACTIONABILITY: Every section must include a "Success Metric" or a specific "Next Step."
4. PERSPECTIVE: Focus on "low-overhead, high-leverage" strategies suitable for the modern online economy.

### OUTPUT STRUCTURE (JSON with Markdown content)
Return a JSON object with:
- "title": A compelling, specific title for this blueprint (no generic titles)
- "description": A one-sentence value proposition for this business model (for marketing)
- "content": The full blueprint in Markdown using EXACTLY these headers:

## [GUIDE TITLE]
*A one-sentence value proposition for this business model.*

### 1. The Strategic Opportunity
- Explain the gap in the current market (2026 focus).
- Identify the core revenue lever.

### 2. Implementation Roadmap (30/60/90 Day)
- **Phase 1 (Setup):** [Specific Action] -> [Metric for Success]
- **Phase 2 (Growth):** [Specific Action] -> [Metric for Success]
- **Phase 3 (Scale):** [Specific Action] -> [Metric for Success]

### 3. High-Leverage Tech Stack
- List 3-4 specific tools required for 2026 (AI agents, automation layers, etc.).

### 4. Enterprise-Level "X-Factor"
- One high-level strategy for scaling this from a solopreneur venture to a $1M+ ARR entity.

### 5. Immediate Action Item
- A single, bolded instruction the user can do in the next 60 minutes.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Level: ${tierLevel}

Research Data:
${research}

Topic Focus: ${topic}

Generate a high-value business blueprint following the exact structure specified. Make it actionable and data-driven based on the 2026 research provided.`
      }
    ],
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
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
