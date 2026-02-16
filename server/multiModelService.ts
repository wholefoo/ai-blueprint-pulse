import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const anthropicClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const geminiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
});

const openrouterClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
});

const perplexityClient = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

interface ModelConfig {
  name: string;
  label: string;
  client: OpenAI;
  model: string;
}

const MODELS: ModelConfig[] = [
  { name: "chatgpt", label: "ChatGPT", client: openaiClient, model: "gpt-4.1" },
  { name: "claude", label: "Claude", client: anthropicClient, model: "claude-sonnet-4-20250514" },
  { name: "gemini", label: "Gemini", client: geminiClient, model: "gemini-2.5-flash" },
  { name: "grok", label: "Grok", client: openrouterClient, model: "x-ai/grok-3-mini-beta" },
  { name: "perplexity", label: "Perplexity", client: perplexityClient, model: "llama-3.1-sonar-small-128k-online" },
];

interface ModelAnalysis {
  model: string;
  label: string;
  analysis: string;
  success: boolean;
}

async function queryModel(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2048,
): Promise<ModelAnalysis> {
  try {
    const response = await config.client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    });
    return {
      model: config.name,
      label: config.label,
      analysis: response.choices[0]?.message?.content || "",
      success: true,
    };
  } catch (error) {
    console.error(`[MultiModel] ${config.label} error:`, error instanceof Error ? error.message : error);
    return {
      model: config.name,
      label: config.label,
      analysis: "",
      success: false,
    };
  }
}

export async function multiModelAnalyze(topic: string, context: string = ""): Promise<{
  individualResults: ModelAnalysis[];
  synthesis: string;
  modelsUsed: string[];
}> {
  const systemPrompt = `You are a sharp business analyst specializing in market research and opportunity identification. Provide unique, specific insights not generic advice. Be concise yet thorough. Focus on data-driven observations, real competitive dynamics, and actionable strategies.`;

  const userPrompt = `Analyze this business topic and identify the top 3 threats, top 3 opportunities, and 3 specific actionable strategies for 2026.

Topic: "${topic}"
${context ? `\nAdditional context:\n${context}` : ""}

Structure your response as:
## Threats
1. [Threat with specific reasoning]
2. [Threat with specific reasoning]
3. [Threat with specific reasoning]

## Opportunities
1. [Opportunity with specific reasoning]
2. [Opportunity with specific reasoning]
3. [Opportunity with specific reasoning]

## Actionable Strategies
1. [Strategy with implementation steps]
2. [Strategy with implementation steps]
3. [Strategy with implementation steps]

Be specific to this exact topic. No generic business advice.`;

  const results = await Promise.allSettled(
    MODELS.map((m) => queryModel(m, systemPrompt, userPrompt, 1536))
  );

  const individualResults: ModelAnalysis[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { model: MODELS[i].name, label: MODELS[i].label, analysis: "", success: false }
  );

  const successfulResults = individualResults.filter((r) => r.success && r.analysis);
  const modelsUsed = successfulResults.map((r) => r.label);

  if (successfulResults.length === 0) {
    return {
      individualResults,
      synthesis: "All AI models failed to respond. Please try again.",
      modelsUsed: [],
    };
  }

  const combinedAnalyses = successfulResults
    .map((r) => `### ${r.label}'s Analysis\n${r.analysis}`)
    .join("\n\n---\n\n");

  let synthesis: string;
  try {
    const synthesisResponse = await openaiClient.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a senior business strategist synthesizing analyses from ${modelsUsed.length} different AI models (${modelsUsed.join(", ")}). Your job is to find consensus, highlight unique insights each model caught that others missed, and produce a definitive combined analysis that is stronger than any individual one.`,
        },
        {
          role: "user",
          content: `Synthesize these ${modelsUsed.length} independent AI analyses about "${topic}" into one definitive report.

${combinedAnalyses}

Produce a synthesis with these sections:

## Consensus Findings
What all models agree on (these are high-confidence insights).

## Unique Insights
Specific points only one model caught that add value.

## Combined Threat Assessment
Top 5 threats ranked by severity (note which models flagged each).

## Combined Opportunity Assessment
Top 5 opportunities ranked by potential (note which models flagged each).

## Master Action Plan
7 prioritized strategies synthesized from all models, with implementation steps.

## Confidence Rating
Rate overall confidence (High/Medium/Low) based on model agreement.

Be specific and actionable. This synthesis should be clearly superior to any single model's output.`,
        },
      ],
      max_tokens: 3072,
      temperature: 0.3,
    });
    synthesis = synthesisResponse.choices[0]?.message?.content || combinedAnalyses;
  } catch (error) {
    console.error("[MultiModel] Synthesis failed, using combined output:", error);
    synthesis = `## Combined Multi-Model Analysis\n\n${combinedAnalyses}`;
  }

  return { individualResults, synthesis, modelsUsed };
}

export async function multiModelBlueprintResearch(
  topic: string,
  tier: string,
  webResearch: string = "",
): Promise<string> {
  const systemPrompt = `You are a business research analyst providing deep-dive market intelligence for a premium business blueprint. Your insights will be used to generate a paid business guide. Be extremely specific and data-driven.`;

  const userPrompt = `Research this topic for a ${tier}-tier business blueprint:

Topic: "${topic}"
${webResearch ? `\nReal-time web research data:\n${webResearch}` : ""}

Provide:
1. Market size and growth trajectory
2. Key player analysis (competitors, partners, suppliers)
3. Customer pain points and willingness to pay
4. Technology enablers and barriers
5. Regulatory considerations
6. 90-day quick-win opportunities
7. Revenue model recommendations

Be specific with numbers, names, and actionable detail.`;

  const results = await Promise.allSettled(
    MODELS.map((m) => queryModel(m, systemPrompt, userPrompt, 2048))
  );

  const successfulResults: ModelAnalysis[] = results
    .map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { model: MODELS[i].name, label: MODELS[i].label, analysis: "", success: false }
    )
    .filter((r) => r.success && r.analysis);

  if (successfulResults.length === 0) {
    return "Multi-model research unavailable. Falling back to single-model analysis.";
  }

  const modelsUsed = successfulResults.map((r) => r.label);

  const combined = successfulResults
    .map((r) => `### ${r.label}'s Research\n${r.analysis}`)
    .join("\n\n---\n\n");

  try {
    const synthesisResponse = await openaiClient.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You synthesize research from ${modelsUsed.length} AI models (${modelsUsed.join(", ")}) into comprehensive business intelligence for a premium blueprint product. Combine the best insights from each model into one cohesive, actionable research document.`,
        },
        {
          role: "user",
          content: `Synthesize this multi-model research about "${topic}" (${tier} tier) into one definitive research brief:

${combined}

Output a single cohesive research document covering:
- Market Analysis (size, growth, key trends)
- Competitive Landscape
- Customer Pain Points & Needs
- Technology & Tools
- Revenue Opportunities
- Implementation Priorities

Cite which model(s) contributed each key insight for transparency.`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    });
    
    const synthesis = synthesisResponse.choices[0]?.message?.content || combined;
    return `# Multi-Model Research: ${topic}\n*Powered by ${modelsUsed.join(" + ")}*\n\n${synthesis}`;
  } catch {
    return `# Multi-Model Research: ${topic}\n*Powered by ${modelsUsed.join(" + ")}*\n\n${combined}`;
  }
}
