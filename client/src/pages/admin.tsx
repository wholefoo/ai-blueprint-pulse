import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Search,
  FileText,
  Loader2,
  BookOpen,
  Rocket,
  Building2,
  Save,
  Eye,
  BarChart,
  Download,
  Pencil,
  Check,
  X,
  Target,
  Zap,
  Send,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Radio,
  Youtube,
  MessageSquare,
  TrendingUp,
  ExternalLink,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Flame,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import type { Blueprint, ResearchSession, BlueprintTier, NexusResearchJob, NexusJobStatus } from "@shared/schema";

const tierOptions: { value: BlueprintTier; label: string; icon: typeof BookOpen }[] = [
  { value: "free", label: "Free", icon: BookOpen },
  { value: "starter", label: "Beginner", icon: BookOpen },
  { value: "growth", label: "Growth", icon: Rocket },
  { value: "enterprise", label: "Enterprise", icon: Building2 },
  { value: "pressing", label: "Most Pressing", icon: Zap },
  { value: "boring", label: "Boring but Necessary", icon: FileText },
  { value: "painpoints", label: "Pain Points", icon: AlertTriangle },
  { value: "ethicalhacks", label: "Ethical Hacks", icon: Lightbulb },
  { value: "trendingusecases", label: "Trending Use Cases", icon: Flame },
  { value: "powerprompts", label: "Power Prompts", icon: Lightbulb },
];

const categoryOptions = [
  // General categories
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Leadership",
  "Technology",
  "Strategy",
  "Customer Service",
  "Data Analysis",
  "Business to Business",
  // Starter tier niches
  "Core Business Fundamentals",
  "Basic Market Analysis",
  "Essential Checklists",
  // Growth tier niches
  "Advanced Scaling Strategies",
  "Competitive Analysis",
  "Growth Frameworks",
  // Enterprise tier niches
  "Enterprise Playbooks",
  "Market Expansion Guides",
  "Risk Management",
  // Most Pressing tier niches
  "Time-Sensitive Strategies",
  "Crisis Management",
  "Quick-Win Tactics",
  "Immediate Action Plans",
  // Boring but Necessary tier niches
  "Compliance Frameworks",
  "Documentation Systems",
  "Process Standardization",
  "Risk Mitigation Basics",
];

// Helper to strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // bold+italic
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/__(.*?)__/g, "$1") // bold underscore
    .replace(/_(.*?)_/g, "$1") // italic underscore
    .replace(/`(.*?)`/g, "$1") // inline code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/~~(.*?)~~/g, "$1"); // strikethrough
}

function generatePDF(blueprint: Blueprint) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper to add text with word wrap and page breaks
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
    const cleanText = stripMarkdown(text);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...color);
    
    const lines = doc.splitTextToSize(cleanText, contentWidth);
    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    }
    yPosition += 4;
  };

  // Header
  doc.setFillColor(28, 43, 71); // Navy
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`${blueprint.tier.toUpperCase()} TIER | ${blueprint.category}`, margin, 15);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(blueprint.title, contentWidth);
  doc.text(titleLines, margin, 28);
  
  yPosition = 50;
  
  // Description
  addText(blueprint.description, 11, false, [100, 100, 100]);
  yPosition += 6;

  // Process markdown content
  const content = blueprint.content || "";
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (line.startsWith("# ")) {
      yPosition += 8;
      addText(line.substring(2), 16, true, [28, 43, 71]);
    } else if (line.startsWith("## ")) {
      yPosition += 6;
      addText(line.substring(3), 14, true, [28, 43, 71]);
    } else if (line.startsWith("### ")) {
      yPosition += 4;
      addText(line.substring(4), 12, true, [50, 50, 50]);
    } else if (line.startsWith("#### ")) {
      yPosition += 3;
      addText(line.substring(5), 11, true, [70, 70, 70]);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      addText("• " + line.substring(2), 10, false);
    } else if (line.match(/^\d+\. /)) {
      addText(line, 10, false);
    } else if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Table row - convert to plain text
      const cells = trimmed.split("|").filter(c => c.trim() && !c.match(/^[-:]+$/));
      if (cells.length > 0) {
        addText(cells.map(c => c.trim()).join(" | "), 9, false);
      }
    } else if (trimmed.match(/^[-:]+\|/)) {
      // Table separator - skip
    } else if (trimmed) {
      addText(trimmed, 10, false);
    } else {
      yPosition += 4;
    }
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`AI Blueprint Pulse | Page ${i} of ${pageCount}`, margin, pageHeight - 10);
  }

  // Download
  const filename = blueprint.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf";
  doc.save(filename);
}

interface DownloadStats {
  totalDownloads: number;
  uniqueUsers: number;
  byBlueprint: { blueprintId: number; title: string; count: number }[];
}

interface PdfDownloadWithBlueprint {
  id: number;
  blueprintId: number;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  blueprint?: Blueprint;
}

const nexusSubmitSchema = z.object({
  businessIdea: z.string().min(3, "Business idea must be at least 3 characters"),
  sector: z.string().optional(),
});

type NexusSubmitFormValues = z.infer<typeof nexusSubmitSchema>;

const STATUS_CONFIG: Record<NexusJobStatus, { label: string; color: string; icon: typeof Clock }> = {
  queued: { label: "Queued", color: "text-muted-foreground", icon: Clock },
  sending: { label: "Connecting", color: "text-blue-500", icon: Send },
  researching: { label: "Researching", color: "text-indigo-500", icon: Search },
  analyzing: { label: "Analyzing", color: "text-violet-500", icon: Activity },
  generating: { label: "Generating", color: "text-purple-500", icon: Sparkles },
  completed: { label: "Completed", color: "text-green-500", icon: CheckCircle2 },
  failed: { label: "Failed", color: "text-destructive", icon: AlertTriangle },
  capacity: { label: "At Capacity", color: "text-orange-500", icon: AlertTriangle },
};

interface YTVideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface YTPainPoint {
  title: string;
  description: string;
  frequency: number;
  severity: "low" | "medium" | "high" | "critical";
  sampleComments: string[];
  businessOpportunity: string;
}

interface YTAnalysis {
  videoInfo: {
    videoId: string;
    title: string;
    channelTitle: string;
    viewCount: string;
    commentCount: string;
  };
  totalCommentsAnalyzed: number;
  painPoints: YTPainPoint[];
  summary: string;
  topOpportunities: string[];
}

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  high: { label: "High", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  critical: { label: "Critical", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

function PainPointDiscovery() {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sector, setSector] = useState("");
  const [analysis, setAnalysis] = useState<YTAnalysis | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<"url" | "search">("url");

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/youtube/search", { query, maxResults: 8 });
      return res.json();
    },
    onError: (error: Error) => {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/youtube/analyze", {
        videoUrl: url,
        sector: sector || undefined,
        maxComments: 200,
      });
      return res.json() as Promise<YTAnalysis>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setExpandedPoints(new Set());
      toast({ title: "Analysis complete", description: `Found ${data.painPoints.length} pain points from ${data.totalCommentsAnalyzed} comments` });
    },
    onError: (error: Error) => {
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
    },
  });

  const handleAnalyze = () => {
    if (!videoUrl.trim()) return;
    analyzeMutation.mutate(videoUrl.trim());
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchMutation.mutate(searchQuery.trim());
  };

  const handleSelectVideo = (vid: YTVideoResult) => {
    setVideoUrl(`https://youtube.com/watch?v=${vid.videoId}`);
    setMode("url");
    analyzeMutation.mutate(`https://youtube.com/watch?v=${vid.videoId}`);
  };

  const toggleExpanded = (index: number) => {
    setExpandedPoints(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card data-testid="card-yt-input">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-yt-title">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Pain Point Discovery
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scrape YouTube comments and use AI to discover business pain points and opportunities
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "url" ? "default" : "outline"}
              onClick={() => setMode("url")}
              data-testid="button-mode-url"
            >
              Paste Video URL
            </Button>
            <Button
              variant={mode === "search" ? "default" : "outline"}
              onClick={() => setMode("search")}
              data-testid="button-mode-search"
            >
              Search YouTube
            </Button>
          </div>

          {mode === "url" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  data-testid="input-yt-url"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!videoUrl.trim() || analyzeMutation.isPending}
                  data-testid="button-analyze-yt"
                >
                  {analyzeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
              <Input
                placeholder="Optional: Focus sector (e.g. SaaS, Healthcare, E-commerce)"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                data-testid="input-yt-sector"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for videos (e.g. 'small business struggles 2025')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-yt-search"
                />
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searchMutation.isPending}
                  data-testid="button-search-yt"
                >
                  {searchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
              <Input
                placeholder="Optional: Focus sector (e.g. SaaS, Healthcare, E-commerce)"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                data-testid="input-yt-sector-search"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {searchMutation.data?.results && searchMutation.data.results.length > 0 && mode === "search" && (
        <Card data-testid="card-yt-search-results">
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchMutation.data.results.map((vid: YTVideoResult) => (
                <div
                  key={vid.videoId}
                  className="flex gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                  onClick={() => handleSelectVideo(vid)}
                  data-testid={`card-yt-result-${vid.videoId}`}
                >
                  {vid.thumbnail && (
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-32 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{vid.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{vid.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analyzeMutation.isPending && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Analyzing YouTube comments...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fetching comments and identifying pain points with AI. This may take 30-60 seconds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !analyzeMutation.isPending && (
        <>
          <Card data-testid="card-yt-video-info">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 flex-wrap">
                <img
                  src={`https://img.youtube.com/vi/${analysis.videoInfo.videoId}/mqdefault.jpg`}
                  alt={analysis.videoInfo.title}
                  className="w-40 h-24 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg" data-testid="text-yt-video-title">
                    {analysis.videoInfo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{analysis.videoInfo.channelTitle}</p>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <Badge variant="secondary">
                      <Eye className="h-3 w-3 mr-1" />
                      {Number(analysis.videoInfo.viewCount).toLocaleString()} views
                    </Badge>
                    <Badge variant="secondary">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {Number(analysis.videoInfo.commentCount).toLocaleString()} comments
                    </Badge>
                    <Badge variant="secondary">
                      <Search className="h-3 w-3 mr-1" />
                      {analysis.totalCommentsAnalyzed} analyzed
                    </Badge>
                  </div>
                </div>
                <a
                  href={`https://youtube.com/watch?v=${analysis.videoInfo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" data-testid="button-open-yt-video">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Pain Points Found ({analysis.painPoints.length})
              </h3>
              {analysis.painPoints.map((point, i) => {
                const sev = severityConfig[point.severity] || severityConfig.medium;
                const isExpanded = expandedPoints.has(i);
                return (
                  <Card key={i} data-testid={`card-painpoint-${i}`}>
                    <CardContent className="pt-6">
                      <div
                        className="flex items-start justify-between gap-2 cursor-pointer"
                        onClick={() => toggleExpanded(i)}
                        data-testid={`button-toggle-painpoint-${i}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={sev.color} data-testid={`badge-severity-${i}`}>
                              {sev.label}
                            </Badge>
                            <Badge variant="outline">
                              Freq: {point.frequency}/10
                            </Badge>
                          </div>
                          <h4 className="font-semibold" data-testid={`text-painpoint-title-${i}`}>
                            {point.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {point.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-3 border-t pt-3">
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1 mb-2">
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                              Business Opportunity
                            </p>
                            <p className="text-sm text-muted-foreground pl-5">
                              {point.businessOpportunity}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1 mb-2">
                              <MessageSquare className="h-4 w-4" />
                              Sample Comments
                            </p>
                            <div className="space-y-2 pl-5">
                              {point.sampleComments.map((comment, j) => (
                                <div key={j} className="text-sm text-muted-foreground border-l-2 pl-3 py-1">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <Card data-testid="card-yt-summary">
                <CardHeader>
                  <CardTitle className="text-base">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid="text-yt-summary">
                    {analysis.summary}
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-yt-opportunities">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Top Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {analysis.topOpportunities.map((opp, i) => (
                      <li key={i} className="flex gap-2 text-sm" data-testid={`text-opportunity-${i}`}>
                        <span className="font-semibold text-muted-foreground flex-shrink-0">{i + 1}.</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Severity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["critical", "high", "medium", "low"].map(sev => {
                      const count = analysis.painPoints.filter(p => p.severity === sev).length;
                      if (count === 0) return null;
                      const config = severityConfig[sev];
                      return (
                        <div key={sev} className="flex items-center justify-between gap-2">
                          <Badge className={config.color}>{config.label}</Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const STAGE_ORDER: NexusJobStatus[] = ["queued", "sending", "researching", "analyzing", "generating", "completed"];

function NexusStatusDashboard() {
  const { toast } = useToast();
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const form = useForm<NexusSubmitFormValues>({
    resolver: zodResolver(nexusSubmitSchema),
    defaultValues: {
      businessIdea: "",
      sector: "",
    },
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<NexusResearchJob[]>({
    queryKey: ["/api/nexus/research"],
    refetchInterval: 5000,
  });

  const { data: activeJob } = useQuery<NexusResearchJob>({
    queryKey: ["/api/nexus/research", activeJobId],
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      const job = query.state.data as NexusResearchJob | undefined;
      if (!job) return 3000;
      if (["completed", "failed", "capacity"].includes(job.status)) return false;
      return 2000;
    },
  });

  useEffect(() => {
    if (!activeJobId && jobs.length > 0) {
      const inProgress = jobs.find(
        (j) => !["completed", "failed", "capacity"].includes(j.status)
      );
      if (inProgress) setActiveJobId(inProgress.id);
    }
  }, [jobs, activeJobId]);

  const submitMutation = useMutation({
    mutationFn: async (data: NexusSubmitFormValues) => {
      const res = await apiRequest("POST", "/api/nexus/research", data);
      return res.json();
    },
    onSuccess: (data: NexusResearchJob) => {
      setActiveJobId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/nexus/research"] });
      toast({
        title: "Research Submitted",
        description: "Your business idea has been sent for research.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: NexusSubmitFormValues) => {
    submitMutation.mutate(values);
  };

  const isTerminal = (status: NexusJobStatus) =>
    ["completed", "failed", "capacity"].includes(status);

  return (
    <div className="space-y-6">
      <Card data-testid="card-nexus-submit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-nexus-title">
            <Radio className="h-5 w-5" />
            Nexus Research Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground" data-testid="text-nexus-description">
            Submit a business idea for deep-dive research via the Nexus workflow engine. The system will gather market intelligence, analyze competitive landscapes, and generate actionable insights.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessIdea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Idea</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the business idea to research..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-nexus-business-idea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Sector (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. SaaS, E-commerce, FinTech"
                          {...field}
                          data-testid="input-nexus-sector"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                data-testid="button-submit-nexus-research"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch Research
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {activeJob && (
        <Card data-testid="card-nexus-active-job">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Nexus Status
              </div>
              {!isTerminal(activeJob.status as NexusJobStatus) && (
                <Badge variant="outline" className="animate-pulse" data-testid="badge-nexus-live">
                  <Radio className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-medium truncate max-w-[60%]" data-testid="text-nexus-idea">
                  {activeJob.businessIdea}
                </span>
                <span className="text-sm text-muted-foreground" data-testid="text-nexus-progress-pct">
                  {activeJob.progress}%
                </span>
              </div>
              <Progress value={activeJob.progress} className="h-3" data-testid="progress-nexus" />
            </div>

            <div className="flex items-center gap-2 flex-wrap" data-testid="status-stages">
              {STAGE_ORDER.map((stage, idx) => {
                const config = STATUS_CONFIG[stage];
                const StageIcon = config.icon;
                const currentIdx = STAGE_ORDER.indexOf(activeJob.status as NexusJobStatus);
                const stageIdx = idx;
                const isActive = activeJob.status === stage;
                const isPast = currentIdx > stageIdx;
                const isFuture = currentIdx < stageIdx;

                return (
                  <div key={stage} className="flex items-center gap-1">
                    {idx > 0 && (
                      <div
                        className={`w-4 h-0.5 ${isPast ? "bg-green-500" : "bg-muted"}`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                        isActive
                          ? "bg-primary/10 font-medium " + config.color
                          : isPast
                          ? "text-green-500"
                          : "text-muted-foreground/50"
                      }`}
                      data-testid={`stage-${stage}`}
                    >
                      <StageIcon className={`h-3 w-3 ${isActive ? "animate-pulse" : ""}`} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm" data-testid="text-nexus-status-message">
              {(() => {
                const config = STATUS_CONFIG[activeJob.status as NexusJobStatus] || STATUS_CONFIG.queued;
                const StatusIcon = config.icon;
                return (
                  <>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                    <span className={config.color}>
                      {activeJob.statusMessage || config.label}
                    </span>
                  </>
                );
              })()}
            </div>

            {activeJob.status === "capacity" && (
              <div className="rounded-md bg-orange-500/10 p-4 text-sm" data-testid="alert-capacity">
                <div className="flex items-center gap-2 font-medium text-orange-500 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  System at Capacity
                </div>
                <p className="text-muted-foreground">
                  The research engine is currently overloaded. The system attempted {activeJob.retryCount} time(s) but received gateway errors.
                  Please try again later.
                </p>
              </div>
            )}

            {activeJob.status === "failed" && activeJob.errorMessage && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm" data-testid="alert-failed">
                <div className="flex items-center gap-2 font-medium text-destructive mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Research Failed
                </div>
                <p className="text-muted-foreground">{activeJob.errorMessage}</p>
              </div>
            )}

            {activeJob.status === "completed" && activeJob.resultData && (
              <div className="space-y-2" data-testid="nexus-results">
                <Label className="text-sm font-semibold">Research Results</Label>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <article className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{activeJob.resultData}</ReactMarkdown>
                  </article>
                </ScrollArea>
              </div>
            )}

            {activeJob.retryCount > 0 && !isTerminal(activeJob.status as NexusJobStatus) && (
              <p className="text-xs text-muted-foreground" data-testid="text-retry-count">
                Attempt {activeJob.retryCount} of 3
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-nexus-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Research History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-jobs">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No research jobs yet. Submit a business idea above to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {jobs.map((job) => {
                  const config = STATUS_CONFIG[job.status as NexusJobStatus] || STATUS_CONFIG.queued;
                  const JobIcon = config.icon;
                  return (
                    <div
                      key={job.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-md hover-elevate cursor-pointer ${
                        activeJobId === job.id ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted/50"
                      }`}
                      onClick={() => setActiveJobId(job.id)}
                      data-testid={`nexus-job-${job.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <JobIcon className={`h-4 w-4 ${config.color}`} />
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                          {job.sector && (
                            <Badge variant="secondary" className="text-xs">{job.sector}</Badge>
                          )}
                        </div>
                        <p className="text-sm truncate">{job.businessIdea}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-16">
                          <Progress value={job.progress} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadsSection() {
  const { data: stats, isLoading: statsLoading } = useQuery<DownloadStats>({
    queryKey: ["/api/admin/downloads/stats"],
  });

  const { data: downloads = [], isLoading: downloadsLoading } = useQuery<PdfDownloadWithBlueprint[]>({
    queryKey: ["/api/admin/downloads"],
  });

  if (statsLoading || downloadsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalDownloads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.uniqueUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Blueprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">
              {stats?.byBlueprint?.[0]?.title || "No downloads yet"}
            </div>
            {stats?.byBlueprint?.[0] && (
              <div className="text-sm text-muted-foreground">
                {stats.byBlueprint[0].count} downloads
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Downloads by Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.byBlueprint && stats.byBlueprint.length > 0 ? (
            <div className="space-y-3">
              {stats.byBlueprint.map((item) => (
                <div key={item.blueprintId} className="flex items-center gap-3">
                  <div className="flex-1 truncate">{item.title}</div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No downloads recorded yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Recent Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {downloads.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {downloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`download-row-${download.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {download.blueprint?.title || `Blueprint #${download.blueprintId}`}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {download.userEmail || "Anonymous"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(download.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No downloads recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Trend Discovery state
  const [discoverCategory, setDiscoverCategory] = useState("general");
  const [discoverResults, setDiscoverResults] = useState("");

  const [researchTopic, setResearchTopic] = useState("");
  const [researchResults, setResearchResults] = useState("");
  const [generatedBlueprint, setGeneratedBlueprint] = useState("");

  const [newBlueprint, setNewBlueprint] = useState({
    title: "",
    description: "",
    content: "",
    tier: "growth" as BlueprintTier,
    category: "Marketing",
    price: 4900,
  });

  const { data: blueprints = [], isLoading: blueprintsLoading } = useQuery<Blueprint[]>({
    queryKey: ["/api/blueprints"],
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ResearchSession[]>({
    queryKey: ["/api/admin/research-sessions"],
  });

  // Trend Discovery mutation
  const discoverMutation = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiRequest("POST", "/api/admin/discover", { category });
      return res.json();
    },
    onSuccess: (data) => {
      setDiscoverResults(data.results || "");
      toast({
        title: "Discovery Complete",
        description: "Found trending needs and opportunities from online communities.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Discovery Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const researchMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await apiRequest("POST", "/api/admin/research", { topic });
      return res.json();
    },
    onSuccess: (data) => {
      setResearchResults(data.searchResults || "");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/research-sessions"] });
      toast({
        title: "Research Complete",
        description: "Real-time trend analysis is ready for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Research Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/generate", {
        topic: researchTopic,
        research: researchResults,
        tier: newBlueprint.tier,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedBlueprint(data.content || "");
      setNewBlueprint((prev) => ({
        ...prev,
        content: data.content || "",
        title: data.title || prev.title,
        description: data.description || prev.description,
      }));
      toast({
        title: "Blueprint Generated",
        description: "Your professional blueprint is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/blueprints", newBlueprint);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blueprints"] });
      setNewBlueprint({
        title: "",
        description: "",
        content: "",
        tier: "growth",
        category: "Marketing",
        price: 4900,
      });
      setResearchTopic("");
      setResearchResults("");
      setGeneratedBlueprint("");
      toast({
        title: "Blueprint Saved",
        description: "Your blueprint has been published to the marketplace.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update blueprint title mutation
  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/blueprints/${id}`, { title });
      return res.json();
    },
    onSuccess: (updatedBlueprint) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blueprints"] });
      setSelectedBlueprint(updatedBlueprint);
      setIsEditingTitle(false);
      toast({
        title: "Title Updated",
        description: "Blueprint title has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
            Blueprint Research Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Synthesize 2026 market trends into actionable guides.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discover Trends
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Research & Generate
            </TabsTrigger>
            <TabsTrigger value="blueprints" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Blueprints
            </TabsTrigger>
            <TabsTrigger value="nexus" className="flex items-center gap-2" data-testid="tab-nexus">
              <Radio className="h-4 w-4" />
              Nexus Status
            </TabsTrigger>
            <TabsTrigger value="painpoints" className="flex items-center gap-2" data-testid="tab-painpoints">
              <Youtube className="h-4 w-4" />
              Pain Point Discovery
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Discovery Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Trend Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search online communities (Reddit, forums, industry sites) to discover unmet needs and blueprint opportunities.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discover-category">Industry Category</Label>
                    <Select
                      value={discoverCategory}
                      onValueChange={setDiscoverCategory}
                    >
                      <SelectTrigger data-testid="select-discover-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Business</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="saas">SaaS / Software</SelectItem>
                        <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                        <SelectItem value="finance">Finance & Investing</SelectItem>
                        <SelectItem value="real estate">Real Estate</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="ai automation">AI & Automation</SelectItem>
                        <SelectItem value="freelance consulting">Freelance & Consulting</SelectItem>
                        <SelectItem value="content creator">Content Creators</SelectItem>
                        <SelectItem value="education">Education & Online Courses</SelectItem>
                        <SelectItem value="food beverage">Food & Beverage</SelectItem>
                        <SelectItem value="hospitality">Hospitality & Travel</SelectItem>
                        <SelectItem value="legal">Legal Services</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing & Supply Chain</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit & Social Impact</SelectItem>
                        <SelectItem value="retail">Retail & Brick-and-Mortar</SelectItem>
                        <SelectItem value="technology">Technology & IT Services</SelectItem>
                        <SelectItem value="construction">Construction & Trades</SelectItem>
                        <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                        <SelectItem value="fitness">Fitness & Sports</SelectItem>
                        <SelectItem value="coaching">Coaching & Personal Development</SelectItem>
                        <SelectItem value="media entertainment">Media & Entertainment</SelectItem>
                        <SelectItem value="professional services">Professional Services</SelectItem>
                        <SelectItem value="crypto web3">Crypto & Web3</SelectItem>
                        <SelectItem value="---starter" disabled>── Starter Tier Niches ──</SelectItem>
                        <SelectItem value="core business fundamentals">Core Business Fundamentals</SelectItem>
                        <SelectItem value="basic market analysis">Basic Market Analysis</SelectItem>
                        <SelectItem value="essential checklists">Essential Checklists</SelectItem>
                        <SelectItem value="---growth" disabled>── Growth Tier Niches ──</SelectItem>
                        <SelectItem value="advanced scaling strategies">Advanced Scaling Strategies</SelectItem>
                        <SelectItem value="competitive analysis">Competitive Analysis</SelectItem>
                        <SelectItem value="growth frameworks">Growth Frameworks</SelectItem>
                        <SelectItem value="---enterprise" disabled>── Enterprise Tier Niches ──</SelectItem>
                        <SelectItem value="enterprise playbooks">Enterprise Playbooks</SelectItem>
                        <SelectItem value="market expansion guides">Market Expansion Guides</SelectItem>
                        <SelectItem value="risk management">Risk Management</SelectItem>
                        <SelectItem value="---pressing" disabled>── Most Pressing Niches ──</SelectItem>
                        <SelectItem value="time-sensitive strategies">Time-Sensitive Strategies</SelectItem>
                        <SelectItem value="crisis management">Crisis Management</SelectItem>
                        <SelectItem value="quick-win tactics">Quick-Win Tactics</SelectItem>
                        <SelectItem value="immediate action plans">Immediate Action Plans</SelectItem>
                        <SelectItem value="---boring" disabled>── Boring but Necessary Niches ──</SelectItem>
                        <SelectItem value="compliance frameworks">Compliance Frameworks</SelectItem>
                        <SelectItem value="documentation systems">Documentation Systems</SelectItem>
                        <SelectItem value="process standardization">Process Standardization</SelectItem>
                        <SelectItem value="risk mitigation basics">Risk Mitigation Basics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => discoverMutation.mutate(discoverCategory)}
                    disabled={discoverMutation.isPending}
                    className="w-full"
                    data-testid="button-discover-trends"
                  >
                    {discoverMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching Communities...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Discover Trending Needs
                      </>
                    )}
                  </Button>

                  {discoverResults && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setActiveTab("research");
                      }}
                      data-testid="button-go-to-research"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Research a Topic
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Discovery Results */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Community Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {discoverMutation.isPending ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : discoverResults ? (
                      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6">
                        {/* Parse and display niche buttons */}
                        {(() => {
                          const nicheMatch = discoverResults.match(/---NICHES---\n([\s\S]*?)---END_NICHES---/);
                          if (nicheMatch) {
                            const niches = nicheMatch[1]
                              .split('\n')
                              .map(n => n.trim())
                              .filter(n => n.length > 0);
                            
                            if (niches.length > 0) {
                              return (
                                <Card className="border-primary/20 bg-primary/5">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Target className="h-4 w-4" />
                                      Click a Niche to Research
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <div className="flex flex-wrap gap-2">
                                      {niches.map((niche, idx) => (
                                        <Button
                                          key={idx}
                                          variant="outline"
                                          size="sm"
                                          className="text-xs"
                                          onClick={() => {
                                            setResearchTopic(niche);
                                            setActiveTab("research");
                                          }}
                                          data-testid={`button-niche-${idx}`}
                                        >
                                          {niche}
                                        </Button>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }
                          }
                          return null;
                        })()}
                        
                        <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif">
                          <ReactMarkdown>
                            {discoverResults.replace(/---NICHES---[\s\S]*?---END_NICHES---/, '')}
                          </ReactMarkdown>
                        </article>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a category and click "Discover Trending Needs" to find opportunities in online communities.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Target Niche</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g., AI-Ops Agency"
                          value={researchTopic}
                          onChange={(e) => setResearchTopic(e.target.value)}
                          data-testid="input-research-topic"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Business Level</Label>
                      <Select
                        value={newBlueprint.tier}
                        onValueChange={(value: BlueprintTier) => setNewBlueprint((prev) => ({ ...prev, tier: value }))}
                      >
                        <SelectTrigger data-testid="select-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tierOptions.map((tier) => (
                            <SelectItem key={tier.value} value={tier.value}>
                              <div className="flex items-center gap-2">
                                <tier.icon className="h-4 w-4" />
                                {tier.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => researchMutation.mutate(researchTopic)}
                      disabled={!researchTopic || researchMutation.isPending}
                      className="w-full"
                      data-testid="button-research"
                    >
                      {researchMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Rocket className="mr-2 h-5 w-5" />
                      )}
                      Generate Blueprint
                    </Button>
                  </CardContent>
                </Card>

                {researchResults && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Research Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="text-xs text-muted-foreground whitespace-pre-wrap" data-testid="text-research-results">
                          {researchResults.slice(0, 500)}...
                        </div>
                      </ScrollArea>
                      <Button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        variant="secondary"
                        className="w-full mt-4"
                        data-testid="button-generate"
                      >
                        {generateMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Refine Blueprint
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {generatedBlueprint ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <Badge className="uppercase tracking-widest text-xs">
                          {tierOptions.find(t => t.value === newBlueprint.tier)?.label} Tier
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => saveMutation.mutate()}
                          disabled={!newBlueprint.title || saveMutation.isPending}
                          className="text-muted-foreground hover:text-primary"
                          data-testid="button-save-catalog"
                        >
                          {saveMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <BookOpen className="mr-2 h-4 w-4" />
                          )}
                          Save to Catalog
                        </Button>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <Input
                          placeholder="Blueprint Title"
                          value={newBlueprint.title}
                          onChange={(e) => setNewBlueprint((prev) => ({ ...prev, title: e.target.value }))}
                          className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0"
                          data-testid="input-title"
                        />
                        <Input
                          placeholder="One-sentence value proposition"
                          value={newBlueprint.description}
                          onChange={(e) => setNewBlueprint((prev) => ({ ...prev, description: e.target.value }))}
                          className="text-sm text-muted-foreground border-0 border-b rounded-none px-0 focus-visible:ring-0"
                          data-testid="input-description"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label className="text-xs">Category</Label>
                          <Select
                            value={newBlueprint.category}
                            onValueChange={(value) => setNewBlueprint((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={(newBlueprint.price / 100)}
                              onChange={(e) => setNewBlueprint((prev) => ({ ...prev, price: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
                              className="pl-7"
                              data-testid="input-price"
                            />
                          </div>
                        </div>
                      </div>

                      <ScrollArea className="h-96 rounded-lg border p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div 
                            className="whitespace-pre-wrap text-sm" 
                            data-testid="text-blueprint-content"
                            dangerouslySetInnerHTML={{ 
                              __html: generatedBlueprint
                                .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2">$1</h2>')
                                .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                            }}
                          />
                        </div>
                      </ScrollArea>

                      <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!newBlueprint.title || !newBlueprint.content || saveMutation.isPending}
                        className="w-full mt-6"
                        data-testid="button-save"
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Publish to Marketplace
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-center">
                      Input a niche and click "Generate" to start research.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Powered by Tavily web search + GPT-5.2
                    </p>
                  </div>
                )}
              </div>
            </div>

          </TabsContent>

          <TabsContent value="nexus" className="space-y-6">
            <NexusStatusDashboard />
          </TabsContent>

          <TabsContent value="painpoints" className="space-y-6">
            <PainPointDiscovery />
          </TabsContent>

          <TabsContent value="blueprints">
            <Card>
              <CardHeader>
                <CardTitle>All Blueprints</CardTitle>
              </CardHeader>
              <CardContent>
                {blueprintsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : blueprints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No blueprints yet. Use the Research & Generate tab to create one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blueprints.map((blueprint) => (
                      <div
                        key={blueprint.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`row-blueprint-${blueprint.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="capitalize">
                              {blueprint.tier}
                            </Badge>
                            <Badge variant="secondary">{blueprint.category}</Badge>
                          </div>
                          <h4 className="font-medium truncate">{blueprint.title}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            ${(blueprint.price / 100).toFixed(2)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedBlueprint(blueprint)}
                            data-testid={`button-view-blueprint-${blueprint.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <DownloadsSection />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedBlueprint} onOpenChange={(open) => {
          if (!open) {
            setSelectedBlueprint(null);
            setIsEditingTitle(false);
          }
        }}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="capitalize">
                {selectedBlueprint?.tier}
              </Badge>
              <Badge variant="secondary">{selectedBlueprint?.category}</Badge>
              <span className="text-sm text-muted-foreground">
                ${((selectedBlueprint?.price || 0) / 100).toFixed(2)}
              </span>
              <Button
                variant="default"
                size="sm"
                className="ml-auto"
                onClick={() => selectedBlueprint && generatePDF(selectedBlueprint)}
                data-testid="button-download-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-serif text-xl h-auto py-1"
                  data-testid="input-edit-title"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedBlueprint) {
                      updateTitleMutation.mutate({ id: selectedBlueprint.id, title: editTitle });
                    } else if (e.key === "Escape") {
                      setIsEditingTitle(false);
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (selectedBlueprint) {
                      updateTitleMutation.mutate({ id: selectedBlueprint.id, title: editTitle });
                    }
                  }}
                  disabled={updateTitleMutation.isPending}
                  data-testid="button-save-title"
                >
                  {updateTitleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(false)}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <DialogTitle className="font-serif text-xl">
                  {selectedBlueprint?.title}
                </DialogTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setEditTitle(selectedBlueprint?.title || "");
                    setIsEditingTitle(true);
                  }}
                  data-testid="button-edit-title"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {selectedBlueprint?.description}
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 pr-2">
            <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif">
              <ReactMarkdown>{selectedBlueprint?.content || ""}</ReactMarkdown>
            </article>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
