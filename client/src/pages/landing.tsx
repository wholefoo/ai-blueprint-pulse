import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target, 
  BarChart3,
  CheckCircle2,
  BookOpen,
  Rocket,
  Building2,
  Gift,
  FileText,
  HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Research",
    description: "Our guides are built on cutting-edge AI analysis of current market trends and proven strategies.",
  },
  {
    icon: TrendingUp,
    title: "Actionable Insights",
    description: "Step-by-step blueprints you can implement immediately to drive measurable business growth.",
  },
  {
    icon: Shield,
    title: "Expert Validated",
    description: "Every guide is reviewed by industry experts to ensure accuracy and real-world applicability.",
  },
];

const tiers = [
  {
    name: "Free Forever",
    slug: "free",
    icon: Gift,
    description: "Get started with essential business insights",
    features: ["Curated free guides", "Basic templates", "Newsletter access", "Community forums"],
    color: "border-gray-200 dark:border-gray-700",
    iconBg: "bg-gray-500/10",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  {
    name: "Starter",
    slug: "starter",
    icon: BookOpen,
    description: "Perfect for entrepreneurs just getting started",
    features: ["Core business fundamentals", "Basic market analysis", "Essential checklists", "Community access"],
    color: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Growth",
    slug: "growth",
    icon: Rocket,
    description: "For businesses ready to scale rapidly",
    features: ["Advanced scaling strategies", "Competitive analysis", "Growth frameworks", "Priority support"],
    color: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    popular: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    icon: Building2,
    description: "Comprehensive guides for established businesses",
    features: ["Enterprise playbooks", "Market expansion guides", "Risk management", "Custom consultations"],
    color: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "Most Pressing",
    slug: "pressing",
    icon: Zap,
    description: "Urgent solutions for critical business challenges",
    features: ["Time-sensitive strategies", "Crisis management", "Quick-win tactics", "Immediate action plans"],
    color: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    name: "Boring but Necessary",
    slug: "boring",
    icon: FileText,
    description: "Essential foundations that every business needs",
    features: ["Compliance frameworks", "Documentation systems", "Process standardization", "Risk mitigation basics"],
    color: "border-slate-200 dark:border-slate-700",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
];

const stats = [
  { value: "AI-Powered", label: "Research Engine" },
  { value: "Real-Time", label: "Market Data" },
  { value: "6 Tiers", label: "Blueprint Levels" },
  { value: "24/7", label: "Instant Access" },
];

const faqs = [
  {
    question: "What exactly is a 'Success Blueprint'?",
    answer: "A Success Blueprint is a comprehensive, AI-researched business guide that provides actionable strategies, frameworks, and step-by-step instructions for specific business challenges. Each blueprint is synthesized using real-time market data and proven methodologies, giving you a clear roadmap to implement immediately."
  },
  {
    question: "How is AI Blueprint Pulse different from other business courses?",
    answer: "Unlike static courses that become outdated, our blueprints are generated using real-time AI research that analyzes current market trends, competitor strategies, and emerging opportunities. You get actionable intelligence based on what's working right now, not strategies from years ago."
  },
  {
    question: "Do I get lifetime access to purchased blueprints?",
    answer: "Yes! Once you purchase a blueprint, it's yours forever. You can download it as a professionally formatted PDF and access it anytime from your dashboard. There are no recurring fees or subscription requirements for purchased content."
  },
  {
    question: "What's the difference between the tier levels?",
    answer: "Our tiers are designed for different business stages: Free gets you started with essentials, Starter covers fundamentals for new entrepreneurs, Growth provides scaling strategies for established businesses, Enterprise offers comprehensive playbooks for larger operations, Most Pressing addresses urgent challenges, and Boring but Necessary covers essential compliance and operations foundations."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Due to the digital nature of our products, all sales are generally final. However, if you believe a blueprint is technically defective or fundamentally fails to address the topic described, we offer a 48-hour correction window where we'll re-run the research or provide a credit for a future guide."
  },
  {
    question: "How often is new content added?",
    answer: "We continuously add new blueprints based on market demands and emerging business trends. Our AI research engine is constantly analyzing opportunities, so you'll see fresh content added regularly across all tier levels."
  },
  {
    question: "What makes actionable blueprints so powerful?",
    answer: "Actionable blueprints eliminate the gap between knowledge and execution. Instead of generic advice, you get specific steps, templates, frameworks, and implementation timelines tailored to your business stage. Each blueprint is designed so you can start implementing within hours of reading—not weeks of planning. This bias toward action is what separates successful entrepreneurs from those stuck in 'research mode' forever."
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span>AI-powered business intelligence</span>
            </div>
            
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" data-testid="text-hero-title">
              Transform Your Business
              <br />
              <span className="text-primary">With Expert Blueprints</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Discover actionable guides built on AI research and industry expertise. 
              From startup fundamentals to enterprise strategies — we've got your path to success.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2" data-testid="button-explore-marketplace">
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button variant="outline" size="lg" asChild data-testid="button-get-started">
                  <a href="/api/login">Get Started Free</a>
                </Button>
              )}
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant download</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold">Why AI Blueprint Pulse?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge AI research with real-world business expertise to create guides that actually work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-muted/30">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold">Choose Your Path</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Whether you're just starting out or leading an enterprise, we have the right blueprint for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative ${tier.color} ${tier.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="pt-8 pb-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${tier.iconBg} mb-4`}>
                    <tier.icon className={`h-6 w-6 ${tier.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-xl mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/marketplace?tier=${tier.slug}`}>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      data-testid={`button-browse-${tier.name.toLowerCase()}`}
                    >
                      Browse {tier.name} Guides
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to know about AI Blueprint Pulse and our success guides.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">Ready to Accelerate Your Success?</h2>
            <p className="text-muted-foreground mb-8">
              Join action taker entrepreneurs and business leaders who have transformed their operations with our blueprints.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2" data-testid="button-cta-marketplace">
                  Start Browsing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
