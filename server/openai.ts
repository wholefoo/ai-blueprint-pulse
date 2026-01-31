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

export async function generateBlueprintContent(topic: string, research: string): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert business guide writer. Create comprehensive, actionable business blueprints based on research data.

Your blueprints should:
1. Be practical and immediately actionable
2. Include step-by-step implementation guides
3. Provide templates and checklists where relevant
4. Include real-world examples and case studies
5. Be written in professional but accessible language

Format your output as valid JSON with:
- title: A compelling, specific title for the blueprint
- description: A 2-3 sentence summary (for marketing)
- content: The full blueprint in Markdown format with proper headers, lists, and sections`
      },
      {
        role: "user",
        content: `Create a comprehensive business blueprint based on this research:

Topic: ${topic}

Research Findings:
${research}

Generate a complete, actionable guide that business owners can implement immediately.`
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
