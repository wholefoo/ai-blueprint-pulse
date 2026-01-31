import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "@/components/tier-badge";
import { useAuth } from "@/hooks/use-auth";
import {
  Download,
  ShoppingBag,
  ArrowRight,
  Calendar,
  FileText,
} from "lucide-react";
import type { Purchase, Blueprint } from "@shared/schema";

interface PurchaseWithBlueprint extends Purchase {
  blueprint?: Blueprint;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<PurchaseWithBlueprint[]>({
    queryKey: ["/api/purchases/detailed"],
  });

  const completedPurchases = purchases.filter((p) => p.status === "completed");

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold" data-testid="text-page-title">
              My Purchases
            </h1>
            <p className="text-muted-foreground mt-1">
              Access your purchased blueprints anytime
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" data-testid="button-browse-more">
              Browse More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {purchasesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : completedPurchases.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Explore our marketplace to find the perfect blueprint for your business needs.
              </p>
              <Link href="/marketplace">
                <Button data-testid="button-explore">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedPurchases.map((purchase) => (
              <Card key={purchase.id} className="hover-elevate" data-testid={`card-purchase-${purchase.id}`}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {purchase.blueprint && (
                          <TierBadge tier={purchase.blueprint.tier} size="sm" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {purchase.blueprint?.category || "Guide"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 truncate" data-testid={`text-title-${purchase.id}`}>
                        {purchase.blueprint?.title || "Blueprint"}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {purchase.blueprint?.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>Markdown</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-bold">
                        ${(purchase.amount / 100).toFixed(2)}
                      </div>
                      <Button size="sm" asChild data-testid={`button-download-${purchase.id}`}>
                        <a href={`/api/blueprints/${purchase.blueprintId}/download`} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
