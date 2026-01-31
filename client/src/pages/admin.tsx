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
  Plus,
  Loader2,
  TrendingUp,
  BookOpen,
  Rocket,
  Building2,
  Save,
  Eye,
} from "lucide-react";
import type { Blueprint, ResearchSession, BlueprintTier } from "@shared/schema";

const tierOptions: { value: BlueprintTier; label: string; icon: typeof BookOpen }[] = [
  { value: "starter", label: "Starter", icon: BookOpen },
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
  const [generatedContent, setGeneratedContent] = useState("");

  const [newBlueprint, setNewBlueprint] = useState({
    title: "",
    description: "",
    content: "",
    tier: "starter" as BlueprintTier,
    category: "Marketing",
    price: 2900,
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
        description: "Trend analysis is ready for review.",
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
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content || "");
      setNewBlueprint((prev) => ({
        ...prev,
        content: data.content || "",
        title: data.title || prev.title,
        description: data.description || prev.description,
      }));
      toast({
        title: "Blueprint Generated",
        description: "Your blueprint content has been created.",
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
        tier: "starter",
        category: "Marketing",
        price: 2900,
      });
      setResearchTopic("");
      setResearchResults("");
      setGeneratedContent("");
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
    <div className="py-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold" data-testid="text-page-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Research trends and generate business blueprints
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
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Trend Research
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Research Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., AI automation for small businesses"
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      data-testid="input-research-topic"
                    />
                  </div>
                  <Button
                    onClick={() => researchMutation.mutate(researchTopic)}
                    disabled={!researchTopic || researchMutation.isPending}
                    className="w-full"
                    data-testid="button-research"
                  >
                    {researchMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="mr-2 h-4 w-4" />
                    )}
                    Analyze Trends
                  </Button>

                  {researchResults && (
                    <div className="space-y-2">
                      <Label>Research Results</Label>
                      <ScrollArea className="h-48 rounded-md border p-3">
                        <div className="text-sm whitespace-pre-wrap" data-testid="text-research-results">
                          {researchResults}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {researchResults && (
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      variant="secondary"
                      className="w-full"
                      data-testid="button-generate"
                    >
                      {generateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Generate Blueprint
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blueprint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Blueprint title"
                      value={newBlueprint.title}
                      onChange={(e) => setNewBlueprint((prev) => ({ ...prev, title: e.target.value }))}
                      data-testid="input-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this blueprint"
                      value={newBlueprint.description}
                      onChange={(e) => setNewBlueprint((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tier</Label>
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

                    <div className="space-y-2">
                      <Label>Category</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (cents)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newBlueprint.price}
                      onChange={(e) => setNewBlueprint((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      data-testid="input-price"
                    />
                    <p className="text-xs text-muted-foreground">
                      Display price: ${(newBlueprint.price / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      placeholder="Blueprint content in Markdown format..."
                      value={newBlueprint.content}
                      onChange={(e) => setNewBlueprint((prev) => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      className="font-mono text-sm"
                      data-testid="input-content"
                    />
                  </div>

                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!newBlueprint.title || !newBlueprint.content || saveMutation.isPending}
                    className="w-full"
                    data-testid="button-save"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Blueprint
                  </Button>
                </CardContent>
              </Card>
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
