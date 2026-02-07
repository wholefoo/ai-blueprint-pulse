import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Rocket, Building2, Gift, Zap, FileText, AlertTriangle } from "lucide-react";
import type { Blueprint } from "@shared/schema";

interface BlueprintCardProps {
  blueprint: Blueprint;
}

const tierConfig = {
  free: {
    label: "Free",
    icon: Gift,
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
  starter: {
    label: "Starter",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  growth: {
    label: "Growth",
    icon: Rocket,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  enterprise: {
    label: "Enterprise",
    icon: Building2,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  pressing: {
    label: "Most Pressing",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  boring: {
    label: "Boring but Necessary",
    icon: FileText,
    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  painpoints: {
    label: "Pain Points",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  const tier = tierConfig[blueprint.tier as keyof typeof tierConfig] || tierConfig.starter;
  const TierIcon = tier.icon;

  return (
    <Card className="group flex flex-col h-full hover-elevate transition-all duration-200" data-testid={`card-blueprint-${blueprint.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge variant="secondary" className={tier.color}>
            <TierIcon className="mr-1 h-3 w-3" />
            {tier.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {blueprint.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2" data-testid={`text-title-${blueprint.id}`}>
          {blueprint.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-description-${blueprint.id}`}>
          {blueprint.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 pt-4 border-t">
        <div className="font-bold text-xl" data-testid={`text-price-${blueprint.id}`}>
          ${(blueprint.price / 100).toFixed(2)}
        </div>
        <Link href={`/blueprint/${blueprint.id}`}>
          <Button size="sm" className="group/btn" data-testid={`button-view-${blueprint.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
