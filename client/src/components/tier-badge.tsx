import { Badge } from "@/components/ui/badge";
import { BookOpen, Rocket, Building2 } from "lucide-react";
import type { BlueprintTier } from "@shared/schema";

interface TierBadgeProps {
  tier: BlueprintTier;
  size?: "sm" | "md" | "lg";
}

const tierConfig = {
  starter: {
    label: "Starter",
    icon: BookOpen,
    description: "Perfect for beginners",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  growth: {
    label: "Growth",
    icon: Rocket,
    description: "For scaling businesses",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  enterprise: {
    label: "Enterprise",
    icon: Building2,
    description: "Advanced strategies",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
};

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge variant="outline" className={`${config.color} ${sizeClasses[size]} font-medium`}>
      <Icon className={`mr-1 ${iconSizes[size]}`} />
      {config.label}
    </Badge>
  );
}

export function TierDescription({ tier }: { tier: BlueprintTier }) {
  return (
    <span className="text-muted-foreground text-sm">
      {tierConfig[tier].description}
    </span>
  );
}
