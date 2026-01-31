import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function analyzeBusinessTrends(topic: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a business trend analyst and researcher. Your task is to analyze current business trends and provide actionable insights. 
        
When given a topic, provide:
1. Current market trends related to this topic
2. Key challenges businesses face
3. Emerging opportunities
4. Best practices from successful companies
5. Actionable recommendations

Format your response in clear sections with bullet points for easy reading.`
      },
      {
        role: "user",
        content: `Analyze current business trends for: ${topic}

Provide comprehensive insights including market analysis, challenges, opportunities, and recommendations.`
      }
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "Unable to generate analysis.";
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
