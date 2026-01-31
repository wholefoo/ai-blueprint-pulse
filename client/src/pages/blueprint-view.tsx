import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "@/components/tier-badge";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Download,
  Lock,
} from "lucide-react";
import type { Blueprint, Purchase } from "@shared/schema";

export default function BlueprintViewPage() {
  const [, params] = useRoute("/blueprint/:id/view");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const blueprintId = params?.id ? parseInt(params.id) : null;

  const { data: blueprint, isLoading } = useQuery<Blueprint>({
    queryKey: ["/api/blueprints", blueprintId],
    enabled: !!blueprintId,
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
    enabled: isAuthenticated,
  });

  const isPurchased = purchases.some(
    (p) => p.blueprintId === blueprintId && p.status === "completed"
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Blueprint not found</h2>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <div className="container py-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Access Required</h2>
        <p className="text-muted-foreground mb-6">
          Purchase this blueprint to view its contents.
        </p>
        <Button onClick={() => navigate(`/blueprint/${blueprintId}`)}>
          View Details & Purchase
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button size="sm" asChild data-testid="button-download">
              <a href={`/api/blueprints/${blueprint.id}/download`} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <TierBadge tier={blueprint.tier} size="lg" />
            <Badge variant="outline">{blueprint.category}</Badge>
          </div>

          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-6" data-testid="text-blueprint-title">
            {blueprint.title}
          </h1>

          <Card>
            <CardContent className="py-8">
              <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-li:text-base">
                <ReactMarkdown>{blueprint.content}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 mt-6">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>AI Disclosure:</strong> Synthesized by the Blueprint Nexus AI-Ops Engine using 
                real-time data from January 2026. Market Dynamics Notice: Blueprints are snapshots of 
                digital trends at a specific point in time. Success in online business depends on 
                execution, market volatility, and external factors beyond the scope of this research tool.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                © 2026 Blueprint Nexus. All Rights Reserved. This Success Blueprint is the proprietary 
                intellectual property of Blueprint Nexus. Unauthorized reproduction, resale, or 
                distribution is strictly prohibited.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
