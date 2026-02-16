import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  Download,
  TrendingUp,
  Coins,
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Target,
  History,
  Star,
  AlertTriangle,
  Lightbulb,
  Flame,
  MessageSquareText,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { BlueprintTier, GeneratedBlueprint } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const tierOptions: { value: string; label: string; icon: typeof BookOpen }[] = [
  { value: "starter", label: "Beginner", icon: BookOpen },
  { value: "growth", label: "Growth", icon: Rocket },
  { value: "enterprise", label: "Enterprise", icon: Building2 },
  { value: "painpoints", label: "Pain Points", icon: AlertTriangle },
  { value: "ethicalhacks", label: "Ethical Hacks", icon: Lightbulb },
  { value: "trendingusecases", label: "Trending Use Cases", icon: Flame },
  { value: "powerprompts", label: "Power Prompts", icon: MessageSquareText },
];

const categoryOptions = [
  "E-Commerce",
  "SaaS",
  "Digital Marketing",
  "Consulting",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Technology",
  "Retail",
  "Manufacturing",
  "Other",
];

export default function StudioPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("generate");
  const [topic, setTopic] = useState("");
  const [selectedTier, setSelectedTier] = useState("growth");
  const [selectedCategory, setSelectedCategory] = useState("Technology");
  const [discoverCategory, setDiscoverCategory] = useState("general");
  const [analyzeTopic, setAnalyzeTopic] = useState("");
  const [previewBlueprint, setPreviewBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [promptTopic, setPromptTopic] = useState("");
  const [promptCategory, setPromptCategory] = useState("Marketing");
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  const creditsQuery = useQuery<{ balance: number; totalPurchased: number; totalUsed: number }>({
    queryKey: ["/api/credits"],
    enabled: isAuthenticated,
  });

  const blueprintsQuery = useQuery<{ blueprints: GeneratedBlueprint[] }>({
    queryKey: ["/api/studio/blueprints"],
    enabled: isAuthenticated,
  });

  const transactionsQuery = useQuery<{ transactions: any[] }>({
    queryKey: ["/api/credits/transactions"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchase = params.get("purchase");
    const sessionId = params.get("session_id");

    if (purchase === "success" && sessionId) {
      apiRequest("POST", "/api/credits/verify", { sessionId })
        .then(res => res.json())
        .then(data => {
          if (data.status === "completed") {
            toast({ title: "Credits Added", description: `Your blueprint credits have been added to your account.` });
            queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
            queryClient.invalidateQueries({ queryKey: ["/api/credits/transactions"] });
          }
        })
        .catch(() => {
          toast({ title: "Verification Issue", description: "We'll verify your purchase shortly.", variant: "destructive" });
        });

      window.history.replaceState({}, "", "/studio");
    } else if (purchase === "cancelled") {
      toast({ title: "Purchase Cancelled", description: "Your credit purchase was cancelled." });
      window.history.replaceState({}, "", "/studio");
    }
  }, []);

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const res = await apiRequest("POST", "/api/credits/purchase", { packageId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start checkout.", variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/studio/generate", {
        topic,
        tier: selectedTier,
        category: selectedCategory,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Blueprint Generated", description: "Your blueprint is ready for download." });
      setPreviewBlueprint(data.blueprint);
      queryClient.invalidateQueries({ queryKey: ["/api/studio/blueprints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits/transactions"] });
      setTopic("");
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate blueprint.", variant: "destructive" });
    },
  });

  const discoverMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/studio/discover", { category: discoverCategory });
      return res.json();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to discover trends.", variant: "destructive" });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/studio/analyze", { topic: analyzeTopic });
      return res.json();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze topic.", variant: "destructive" });
    },
  });

  const multiAnalyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/studio/multi-analyze", { topic: analyzeTopic });
      return res.json();
    },
    onError: () => {
      toast({ title: "Error", description: "Multi-model analysis failed.", variant: "destructive" });
    },
  });

  const promptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/studio/generate", {
        topic: promptTopic,
        tier: "powerprompts",
        category: promptCategory,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Prompts Generated", description: "Your power prompts are ready." });
      queryClient.invalidateQueries({ queryKey: ["/api/studio/blueprints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits/transactions"] });
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate prompts.", variant: "destructive" });
    },
  });

  const handleCopyPrompt = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    });
  };

  const handleDownload = async (blueprintId: number, title: string) => {
    try {
      const res = await fetch(`/api/studio/blueprints/${blueprintId}/download`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + ".docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "Failed to download blueprint.", variant: "destructive" });
    }
  };

  const balance = creditsQuery.data?.balance || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-studio-title">Blueprint Studio</h1>
            <p className="text-muted-foreground text-sm">Generate custom business blueprints with full resale rights</p>
          </div>
          <div className="flex flex-row items-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium" data-testid="text-credit-balance">
                    {creditsQuery.isLoading ? "..." : balance} Credit{balance !== 1 ? "s" : ""}
                  </span>
                </div>
              </Card>
            ) : (
              <Button asChild data-testid="button-studio-login">
                <a href="/api/login">Sign In to Get Started</a>
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-studio">
            <TabsTrigger value="generate" data-testid="tab-generate">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="discover" data-testid="tab-discover">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="blueprints" data-testid="tab-blueprints">
              <FileText className="h-4 w-4 mr-1.5" />
              My Blueprints
            </TabsTrigger>
            <TabsTrigger value="prompts" data-testid="tab-prompts">
              <MessageSquareText className="h-4 w-4 mr-1.5" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="credits" data-testid="tab-credits">
              <CreditCard className="h-4 w-4 mr-1.5" />
              Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {!isAuthenticated && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex flex-row items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Sign In to Generate Blueprints</p>
                      <p className="text-sm text-muted-foreground">Create an account to purchase credits and start generating custom blueprints</p>
                    </div>
                  </div>
                  <Button asChild data-testid="button-generate-login">
                    <a href="/api/login">
                      <ArrowRight className="h-4 w-4 mr-1.5" />
                      Sign In
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
            {isAuthenticated && balance === 0 && !creditsQuery.isLoading && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex flex-row items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground">No Credits Available</p>
                      <p className="text-sm text-muted-foreground">Purchase credits to start generating blueprints</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("credits")} data-testid="button-buy-credits-cta">
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Buy Credits
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5" />
                    Generate Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Business Topic</label>
                    <Input
                      placeholder="e.g. AI-powered customer service automation"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      data-testid="input-topic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Blueprint Tier</label>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger data-testid="select-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tierOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      onClick={() => generateMutation.mutate()}
                      disabled={!topic.trim() || generateMutation.isPending || balance === 0}
                      data-testid="button-generate"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1.5" />
                          Generate Blueprint (1 Credit)
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" asChild data-testid="button-generate-signin">
                      <a href="/api/login">
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                        Sign In to Generate
                      </a>
                    </Button>
                  )}
                  {isAuthenticated && balance > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {balance} credit{balance !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generateMutation.isPending ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI is generating your blueprint...
                      </div>
                    </div>
                  ) : previewBlueprint ? (
                    <div className="space-y-3">
                      <div className="flex flex-row items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid="text-preview-title">{previewBlueprint.title}</h3>
                          <p className="text-sm text-muted-foreground">{previewBlueprint.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(previewBlueprint.id, previewBlueprint.title)}
                          data-testid="button-download-preview"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          DOCX
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto">
                        <ReactMarkdown>{previewBlueprint.content.slice(0, 2000)}</ReactMarkdown>
                        {previewBlueprint.content.length > 2000 && (
                          <p className="text-sm text-muted-foreground italic">... content truncated. Download the full DOCX file.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Enter a topic and generate your first blueprint</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Discover Trending Needs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select value={discoverCategory} onValueChange={setDiscoverCategory}>
                      <SelectTrigger data-testid="select-discover-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Business</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      onClick={() => discoverMutation.mutate()}
                      disabled={discoverMutation.isPending}
                      data-testid="button-discover"
                    >
                      {discoverMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Discovering...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-1.5" />
                          Discover Trends
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" asChild data-testid="button-discover-signin">
                      <a href="/api/login">
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                        Sign In to Discover Trends
                      </a>
                    </Button>
                  )}

                  {discoverMutation.data?.result && (
                    <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto pt-2">
                      <ReactMarkdown>{discoverMutation.data.result}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Analyze a Topic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Topic to Analyze</label>
                    <Input
                      placeholder="e.g. AI chatbots for small businesses"
                      value={analyzeTopic}
                      onChange={(e) => setAnalyzeTopic(e.target.value)}
                      data-testid="input-analyze-topic"
                    />
                  </div>
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => analyzeMutation.mutate()}
                        disabled={!analyzeTopic.trim() || analyzeMutation.isPending || multiAnalyzeMutation.isPending}
                        data-testid="button-analyze"
                      >
                        {analyzeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-1.5" />
                            Quick Analyze
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => multiAnalyzeMutation.mutate()}
                        disabled={!analyzeTopic.trim() || multiAnalyzeMutation.isPending || analyzeMutation.isPending}
                        data-testid="button-multi-analyze"
                      >
                        {multiAnalyzeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            Running 4 AI Models...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1.5" />
                            Multi-Model Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" asChild data-testid="button-analyze-signin">
                      <a href="/api/login">
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                        Sign In to Analyze
                      </a>
                    </Button>
                  )}

                  {multiAnalyzeMutation.data && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-row items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground">Powered by:</span>
                        {multiAnalyzeMutation.data.modelsUsed?.map((m: string) => (
                          <Badge key={m} variant="secondary" data-testid={`badge-model-${m.toLowerCase()}`}>{m}</Badge>
                        ))}
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-h-[500px] overflow-y-auto">
                        <ReactMarkdown>{multiAnalyzeMutation.data.synthesis}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {analyzeMutation.data?.analysis && !multiAnalyzeMutation.data && (
                    <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto pt-2">
                      <ReactMarkdown>{analyzeMutation.data.analysis}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blueprints" className="space-y-4">
            {!isAuthenticated ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6 text-center space-y-4">
                  <FileText className="h-10 w-10 mx-auto text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-lg">Sign In to View Your Blueprints</p>
                    <p className="text-sm text-muted-foreground mt-1">Create an account to generate and manage your custom business blueprints</p>
                  </div>
                  <Button asChild data-testid="button-blueprints-login">
                    <a href="/api/login">
                      <ArrowRight className="h-4 w-4 mr-1.5" />
                      Sign In
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
            <>
            <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">My Generated Blueprints</h2>
              <Badge variant="secondary">
                {blueprintsQuery.data?.blueprints?.length || 0} total
              </Badge>
            </div>

            {blueprintsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : blueprintsQuery.data?.blueprints?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blueprintsQuery.data.blueprints.map((bp) => {
                  const tierOpt = tierOptions.find(t => t.value === bp.tier);
                  const TierIcon = tierOpt?.icon || FileText;
                  return (
                    <Card key={bp.id} className="hover-elevate" data-testid={`card-blueprint-${bp.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-row items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <TierIcon className="h-4 w-4 text-primary" />
                            <Badge variant="secondary" className="text-xs">{tierOpt?.label || bp.tier}</Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">{bp.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2" data-testid={`text-blueprint-title-${bp.id}`}>
                          {bp.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{bp.description}</p>
                        <div className="flex flex-row items-center justify-between gap-2 pt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(bp.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(bp.id, bp.title)}
                            data-testid={`button-download-${bp.id}`}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            DOCX
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No Blueprints Yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Generate your first blueprint to get started</p>
                  <Button onClick={() => setActiveTab("generate")} data-testid="button-go-generate">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Generate a Blueprint
                  </Button>
                </CardContent>
              </Card>
            )}
            </>
            )}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquareText className="h-5 w-5" />
                    Generate Power Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a set of high-impact AI prompts tailored to your business topic. Each generation uses 1 credit and produces a collection of ready-to-use prompts.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Business Topic</label>
                    <Input
                      placeholder="e.g. Social media content strategy for SaaS"
                      value={promptTopic}
                      onChange={(e) => setPromptTopic(e.target.value)}
                      data-testid="input-prompt-topic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select value={promptCategory} onValueChange={setPromptCategory}>
                      <SelectTrigger data-testid="select-prompt-category">
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
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      onClick={() => promptMutation.mutate()}
                      disabled={!promptTopic.trim() || promptMutation.isPending || balance === 0}
                      data-testid="button-generate-prompts"
                    >
                      {promptMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Generating Prompts...
                        </>
                      ) : (
                        <>
                          <MessageSquareText className="h-4 w-4 mr-1.5" />
                          Generate Prompts (1 Credit)
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" asChild data-testid="button-prompts-signin">
                      <a href="/api/login">
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                        Sign In to Generate Prompts
                      </a>
                    </Button>
                  )}
                  {isAuthenticated && balance > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {balance} credit{balance !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                  {isAuthenticated && balance === 0 && !creditsQuery.isLoading && (
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("credits")} data-testid="button-prompts-buy-credits">
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Buy Credits to Get Started
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5" />
                    Generated Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {promptMutation.isPending ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI is crafting your power prompts...
                      </div>
                    </div>
                  ) : promptMutation.data?.blueprint ? (
                    <div className="space-y-3">
                      <div className="flex flex-row items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid="text-prompt-title">{promptMutation.data.blueprint.title}</h3>
                          <p className="text-sm text-muted-foreground">{promptMutation.data.blueprint.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPrompt(promptMutation.data.blueprint.content, promptMutation.data.blueprint.id)}
                            data-testid="button-copy-prompts"
                          >
                            {copiedPromptId === promptMutation.data.blueprint.id ? (
                              <><Check className="h-3 w-3 mr-1" /> Copied</>
                            ) : (
                              <><Copy className="h-3 w-3 mr-1" /> Copy All</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(promptMutation.data.blueprint.id, promptMutation.data.blueprint.title)}
                            data-testid="button-download-prompts"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            DOCX
                          </Button>
                        </div>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto">
                        <ReactMarkdown>{promptMutation.data.blueprint.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquareText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Enter a topic to generate tailored power prompts</p>
                      <p className="text-xs text-muted-foreground mt-1">You'll get a collection of ready-to-use AI prompts for your business</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {(() => {
              const promptBlueprints = blueprintsQuery.data?.blueprints?.filter(bp => bp.tier === "powerprompts") || [];
              if (promptBlueprints.length === 0) return null;
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Previous Prompt Sets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promptBlueprints.map((bp) => (
                      <Card key={bp.id} className="hover-elevate" data-testid={`card-prompt-${bp.id}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex flex-row items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <MessageSquareText className="h-4 w-4 text-violet-500" />
                              <Badge variant="secondary" className="text-xs">Power Prompts</Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">{bp.category}</Badge>
                          </div>
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2">{bp.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{bp.description}</p>
                          <div className="flex flex-row items-center justify-between gap-2 pt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(bp.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyPrompt(bp.content, bp.id)}
                                data-testid={`button-copy-prompt-${bp.id}`}
                              >
                                {copiedPromptId === bp.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDownload(bp.id, bp.title)}
                                data-testid={`button-download-prompt-${bp.id}`}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            {!isAuthenticated && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex flex-row items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Sign In to Purchase Credits</p>
                      <p className="text-sm text-muted-foreground">Create an account to buy credits and start generating custom blueprints</p>
                    </div>
                  </div>
                  <Button asChild data-testid="button-credits-login">
                    <a href="/api/login">
                      <ArrowRight className="h-4 w-4 mr-1.5" />
                      Sign In
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
            {isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <Coins className="h-6 w-6 mx-auto text-amber-500" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-credits-balance">{creditsQuery.data?.balance || 0}</p>
                    <p className="text-xs text-muted-foreground">Available Credits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <ShoppingCart className="h-6 w-6 mx-auto text-green-500" />
                    <p className="text-2xl font-bold text-foreground">{creditsQuery.data?.totalPurchased || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Purchased</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <Sparkles className="h-6 w-6 mx-auto text-blue-500" />
                    <p className="text-2xl font-bold text-foreground">{creditsQuery.data?.totalUsed || 0}</p>
                    <p className="text-xs text-muted-foreground">Blueprints Generated</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <h3 className="text-lg font-semibold text-foreground">Purchase Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "single", credits: 1, price: "$10", perCredit: "$10.00", label: "Starter", desc: "Try it out" },
                { id: "five", credits: 5, price: "$40", perCredit: "$8.00", label: "Popular", desc: "Best for growing businesses", popular: true },
                { id: "ten", credits: 10, price: "$75", perCredit: "$7.50", label: "Best Value", desc: "Maximum savings" },
              ].map((pkg) => (
                <Card key={pkg.id} className={pkg.popular ? "border-primary/50 relative" : ""} data-testid={`card-package-${pkg.id}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 text-center space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{pkg.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{pkg.price}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.perCredit} per blueprint</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{pkg.credits} Blueprint Credit{pkg.credits > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Full Resale Rights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>DOCX Download</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{pkg.desc}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => isAuthenticated ? purchaseMutation.mutate(pkg.id) : (window.location.href = "/api/login")}
                      disabled={isAuthenticated && purchaseMutation.isPending}
                      data-testid={`button-purchase-${pkg.id}`}
                    >
                      {purchaseMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-1.5" />
                          Purchase
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {transactionsQuery.data?.transactions?.length ? (
              <>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </h3>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {transactionsQuery.data.transactions.slice(0, 20).map((tx: any) => (
                        <div key={tx.id} className="flex flex-row items-center justify-between gap-4 p-3 flex-wrap" data-testid={`row-transaction-${tx.id}`}>
                          <div className="flex items-center gap-3">
                            {tx.type === "purchase" ? (
                              <div className="h-8 w-8 rounded-md bg-green-500/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={tx.amount > 0 ? "default" : "secondary"}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount} credit{Math.abs(tx.amount) !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
