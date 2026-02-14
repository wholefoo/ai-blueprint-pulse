import { Badge } from "@/components/ui/badge";
import { BookOpen, Rocket, Building2, Gift, Zap, FileText, AlertTriangle, Lightbulb, Flame, MessageSquareText } from "lucide-react";
import type { BlueprintTier } from "@shared/schema";

interface TierBadgeProps {
  tier: BlueprintTier;
  size?: "sm" | "md" | "lg";
}

const tierConfig: Record<BlueprintTier, { label: string; icon: typeof BookOpen; description: string; color: string }> = {
  free: {
    label: "Free",
    icon: Gift,
    description: "Free forever",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
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
  pressing: {
    label: "Most Pressing",
    icon: Zap,
    description: "Urgent business needs",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  boring: {
    label: "Boring but Necessary",
    icon: FileText,
    description: "Essential foundations",
    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  },
  painpoints: {
    label: "Pain Points",
    icon: AlertTriangle,
    description: "Solving key challenges",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  ethicalhacks: {
    label: "Ethical Hacks",
    icon: Lightbulb,
    description: "Smart shortcuts and strategies",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  },
  trendingusecases: {
    label: "Trending Use Cases",
    icon: Flame,
    description: "Hot emerging opportunities",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  powerprompts: {
    label: "Power Prompts",
    icon: MessageSquareText,
    description: "High-impact AI prompts for business",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
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
