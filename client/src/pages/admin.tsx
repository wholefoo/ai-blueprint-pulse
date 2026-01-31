import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Save,
  Eye,
  BarChart,
} from "lucide-react";
import type { Blueprint, ResearchSession, BlueprintTier } from "@shared/schema";

const tierOptions: { value: BlueprintTier; label: string; icon: typeof BookOpen }[] = [
  { value: "starter", label: "Beginner", icon: BookOpen },
  { value: "growth", label: "Growth", icon: Rocket },
  { value: "enterprise", label: "Enterprise", icon: Building2 },
];

const categoryOptions = [
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Leadership",
  "Technology",
  "Strategy",
];

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("research");

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
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Research & Generate
            </TabsTrigger>
            <TabsTrigger value="blueprints" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Blueprints
            </TabsTrigger>
          </TabsList>

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
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/blueprint/${blueprint.id}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
