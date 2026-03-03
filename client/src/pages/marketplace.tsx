import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlueprintCard } from "@/components/blueprint-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, BookOpen, Rocket, Building2, LayoutGrid, Gift, Zap, FileText, AlertTriangle, Lightbulb, Flame, MessageSquareText, Headphones, Database, Megaphone, Settings, Handshake } from "lucide-react";
import type { Blueprint, BlueprintTier } from "@shared/schema";
import { SEO, BreadcrumbSchema } from "@/components/seo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tiers = [
  { value: "all", label: "All Tiers", icon: LayoutGrid },
  { value: "free", label: "Free", icon: Gift },
  { value: "starter", label: "Starter", icon: BookOpen },
  { value: "growth", label: "Growth", icon: Rocket },
  { value: "enterprise", label: "Enterprise", icon: Building2 },
  { value: "pressing", label: "Urgent", icon: Zap },
  { value: "boring", label: "Necessary", icon: FileText },
  { value: "painpoints", label: "Pain Points", icon: AlertTriangle },
  { value: "ethicalhacks", label: "Hacks", icon: Lightbulb },
  { value: "trendingusecases", label: "Trends", icon: Flame },
  { value: "powerprompts", label: "Prompts", icon: MessageSquareText },
  { value: "customerservice", label: "Service", icon: Headphones },
  { value: "dataanalysis", label: "Data", icon: Database },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "operations", label: "Operations", icon: Settings },
  { value: "b2b", label: "B2B", icon: Handshake },
];

const categories = [
  "All Categories",
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
];

export default function MarketplacePage() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tierFromUrl = urlParams.get("tier") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>(tierFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Update tier when URL changes (e.g., from footer links)
  useEffect(() => {
    setSelectedTier(tierFromUrl);
  }, [tierFromUrl]);

  const { data: blueprints = [], isLoading } = useQuery<Blueprint[]>({
    queryKey: ["/api/blueprints"],
  });

  const filteredBlueprints = useMemo(() => {
    let result = [...blueprints];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      );
    }

    if (selectedTier !== "all") {
      result = result.filter((b) => b.tier === selectedTier);
    }

    if (selectedCategory !== "All Categories") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [blueprints, searchQuery, selectedTier, selectedCategory, sortBy]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(blueprints.map((b) => b.category));
    return ["All Categories", ...Array.from(cats)];
  }, [blueprints]);

  return (
    <div className="py-8">
      <SEO
        title="Blueprint Marketplace"
        description="Browse AI-researched business blueprints across 15 categories. Starter, Growth, and Enterprise guides with actionable strategies, frameworks, and implementation plans."
        path="/marketplace"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Marketplace", url: "/marketplace" }]} />
      <div className="container">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2" data-testid="text-page-title">
            Blueprint Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover actionable guides to transform your business
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedTier} onValueChange={setSelectedTier} className="mb-8">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 p-1">
            {tiers.map((tier) => (
              <TabsTrigger
                key={tier.value}
                value={tier.value}
                className="flex items-center gap-1.5 px-3"
                data-testid={`tab-${tier.value}`}
              >
                <tier.icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tier.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBlueprints.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No blueprints found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedTier("all");
                setSelectedCategory("All Categories");
              }}
              data-testid="button-clear-filters"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                Showing {filteredBlueprints.length} blueprint{filteredBlueprints.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBlueprints.map((blueprint) => (
                <BlueprintCard key={blueprint.id} blueprint={blueprint} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
