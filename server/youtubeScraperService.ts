import { openai } from "./openai";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeComment {
  authorName: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  viewCount: string;
  commentCount: string;
}

export interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  severity: "low" | "medium" | "high" | "critical";
  sampleComments: string[];
  businessOpportunity: string;
}

export interface PainPointAnalysis {
  videoInfo: VideoInfo;
  totalCommentsAnalyzed: number;
  painPoints: PainPoint[];
  summary: string;
  topOpportunities: string[];
}

export function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`YouTube API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  const video = data.items[0];
  return {
    videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    description: video.snippet.description?.substring(0, 500) || "",
    viewCount: video.statistics.viewCount || "0",
    commentCount: video.statistics.commentCount || "0",
  };
}

export async function fetchComments(
  videoId: string,
  maxComments: number = 200
): Promise<YouTubeComment[]> {
  const comments: YouTubeComment[] = [];
  let nextPageToken: string | undefined;

  while (comments.length < maxComments) {
    const url = new URL(`${YOUTUBE_API_BASE}/commentThreads`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("textFormat", "plainText");
    url.searchParams.set("key", YOUTUBE_API_KEY);
    if (nextPageToken) {
      url.searchParams.set("pageToken", nextPageToken);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 403) {
        throw new Error("Comments are disabled for this video or API quota exceeded");
      }
      throw new Error(`YouTube API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) break;

    for (const item of data.items) {
      const snippet = item.snippet.topLevelComment.snippet;
      comments.push({
        authorName: snippet.authorDisplayName,
        text: snippet.textDisplay,
        likeCount: snippet.likeCount || 0,
        publishedAt: snippet.publishedAt,
      });
    }

    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }

  return comments.slice(0, maxComments);
}

export async function searchVideos(
  query: string,
  maxResults: number = 5
): Promise<Array<{ videoId: string; title: string; channelTitle: string; thumbnail: string }>> {
  const url = new URL(`${YOUTUBE_API_BASE}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("order", "relevance");
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`YouTube Search API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
  }));
}

export async function analyzePainPoints(
  comments: YouTubeComment[],
  videoInfo: VideoInfo,
  sector?: string
): Promise<PainPointAnalysis> {
  const commentTexts = comments
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 150)
    .map((c, i) => `[${i + 1}] (${c.likeCount} likes) ${c.text}`)
    .join("\n");

  const sectorContext = sector ? `Focus specifically on pain points related to the "${sector}" sector/industry.` : "";

  const systemPrompt = `You are a Business Pain Point Analyst specializing in extracting actionable business insights from customer feedback and online discussions.

Your task is to analyze YouTube comments to identify recurring business pain points, frustrations, and unmet needs that represent potential business opportunities.

${sectorContext}

Analyze the comments and return a JSON response with this exact structure:
{
  "painPoints": [
    {
      "title": "Short descriptive title of the pain point",
      "description": "Detailed explanation of the pain point and why it matters",
      "frequency": <number 1-10 representing how often this appears>,
      "severity": "low|medium|high|critical",
      "sampleComments": ["exact quote from comment 1", "exact quote from comment 2"],
      "businessOpportunity": "How this pain point could be turned into a business solution"
    }
  ],
  "summary": "Overall summary of the pain point landscape found in these comments",
  "topOpportunities": ["Top business opportunity 1", "Top business opportunity 2", "Top business opportunity 3"]
}

Rules:
- Identify 5-15 distinct pain points
- Focus on BUSINESS-relevant pain points (not just general complaints)
- Severity levels: low (minor annoyance), medium (significant frustration), high (major blocker), critical (urgent unmet need)
- Include 1-3 actual comment quotes as evidence for each pain point
- Keep sample comments concise (truncate if very long)
- Business opportunities should be specific and actionable
- Return ONLY valid JSON, no markdown formatting`;

  const userPrompt = `Video: "${videoInfo.title}" by ${videoInfo.channelTitle}
Views: ${videoInfo.viewCount} | Comments: ${videoInfo.commentCount}
Description: ${videoInfo.description}

--- COMMENTS (${comments.length} total, sorted by likes) ---
${commentTexts}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI analysis");
  }

  const analysis = JSON.parse(content);

  return {
    videoInfo,
    totalCommentsAnalyzed: comments.length,
    painPoints: analysis.painPoints || [],
    summary: analysis.summary || "",
    topOpportunities: analysis.topOpportunities || [],
  };
}
