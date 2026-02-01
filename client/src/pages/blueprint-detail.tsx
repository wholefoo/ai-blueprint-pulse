import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "@/components/tier-badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  ShoppingCart,
  Download,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Loader2,
} from "lucide-react";
import type { Blueprint, Purchase } from "@shared/schema";

export default function BlueprintDetailPage() {
  const [, params] = useRoute("/blueprint/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
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

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout", { blueprintId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.free) {
        // Free blueprint - purchase completed immediately
        toast({
          title: "Success!",
          description: "Your free blueprint is ready to download.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      } else if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    purchaseMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Blueprint not found</h2>
        <Button onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/marketplace")}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          <div className="flex flex-wrap items-start gap-3 mb-4">
            <TierBadge tier={blueprint.tier} size="lg" />
            <Badge variant="outline">{blueprint.category}</Badge>
          </div>

          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4" data-testid="text-blueprint-title">
            {blueprint.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-8" data-testid="text-blueprint-description">
            {blueprint.description}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">What's Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive step-by-step guide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Actionable templates and checklists</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Real-world case studies and examples</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Lifetime access to updates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">About This Blueprint</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>
                      This comprehensive blueprint is designed to provide you with actionable insights
                      and strategies that you can implement immediately. Built on AI-powered research
                      and validated by industry experts, this guide covers everything you need to know
                      to succeed in your business endeavors.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>AI Disclosure:</strong> Synthesized by the Blueprint Nexus AI-Ops Engine using 
                    real-time data from January 2026. Market Dynamics Notice: Blueprints are snapshots of 
                    digital trends at a specific point in time. Success in online business depends on 
                    execution, market volatility, and external factors beyond the scope of this research tool. 
                    Blueprint Nexus provides "Blueprints," not "Guarantees."
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    © 2026 Blueprint Nexus. All Rights Reserved. This Success Blueprint is the proprietary 
                    intellectual property of Blueprint Nexus. Unauthorized reproduction, resale, or 
                    distribution is strictly prohibited.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2" data-testid="text-price">
                    ${(blueprint.price / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">One-time purchase</p>

                  {isPurchased ? (
                    <Button className="w-full mb-4" asChild data-testid="button-download">
                      <a href={`/api/blueprints/${blueprint.id}/download`} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Blueprint
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full mb-4"
                      onClick={handlePurchase}
                      disabled={purchaseMutation.isPending}
                      data-testid="button-purchase"
                    >
                      {purchaseMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      {purchaseMutation.isPending ? "Processing..." : "Purchase Now"}
                    </Button>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Markdown format</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Instant delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>48-hour quality guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
