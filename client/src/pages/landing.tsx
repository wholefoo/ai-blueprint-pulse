import { useEffect, useRef } from "react";
import { Link } from "wouter";
import aiInfographic from "@assets/Gemini_Generated_Image_Good,_Bad,_Ugly_1771819461158.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
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
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Flame,
  MessageSquareText,
  CreditCard,
  Star,
  Coins,
  Clock,
  Headphones,
  Database,
  Megaphone,
  Settings,
  Handshake,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "5-Model AI Analysis",
    description: "Every blueprint is powered by ChatGPT, Claude, Gemini, Grok, and Perplexity working together for unmatched accuracy and depth.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Actionable Insights",
    description: "Step-by-step blueprints you can implement immediately to drive measurable business growth.",
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Shield,
    title: "Consensus-Verified",
    description: "Cross-validated by multiple AI models to surface high-confidence insights no single model would catch alone.",
    gradient: "from-purple-500/10 to-violet-500/10",
    iconColor: "text-purple-500",
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
    accentTop: "from-gray-400 to-gray-500",
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
    accentTop: "from-emerald-400 to-emerald-600",
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
    accentTop: "from-blue-400 to-blue-600",
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
    accentTop: "from-purple-400 to-purple-600",
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
    accentTop: "from-amber-400 to-amber-600",
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
    accentTop: "from-slate-400 to-slate-500",
  },
  {
    name: "Pain Points",
    slug: "painpoints",
    icon: AlertTriangle,
    description: "Solve the biggest challenges your customers face",
    features: ["Customer frustration analysis", "Root cause breakdowns", "Practical remedies", "Opportunity mapping"],
    color: "border-red-200 dark:border-red-800",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    accentTop: "from-red-400 to-red-600",
  },
  {
    name: "Ethical Hacks",
    slug: "ethicalhacks",
    icon: Lightbulb,
    description: "Smart shortcuts and creative strategies for an edge",
    features: ["Growth hacking tactics", "Lesser-known strategies", "Innovative approaches", "Responsible shortcuts"],
    color: "border-teal-200 dark:border-teal-800",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
    accentTop: "from-teal-400 to-teal-600",
  },
  {
    name: "Trending Use Cases",
    slug: "trendingusecases",
    icon: Flame,
    description: "Capitalize on hot emerging opportunities",
    features: ["Real-world trend analysis", "Early adopter advantages", "Market momentum guides", "Emerging tech playbooks"],
    color: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    accentTop: "from-rose-400 to-rose-600",
  },
  {
    name: "Power Prompts",
    slug: "powerprompts",
    icon: MessageSquareText,
    description: "High-impact AI prompts to supercharge your business",
    features: ["Ready-to-use AI prompts", "Business automation scripts", "Content generation templates", "Decision-making frameworks"],
    color: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    accentTop: "from-violet-400 to-violet-600",
  },
  {
    name: "Customer Service",
    slug: "customerservice",
    icon: Headphones,
    description: "Deliver outstanding support and build lasting loyalty",
    features: ["Support workflow optimization", "Customer retention strategies", "Complaint resolution frameworks", "Service quality metrics"],
    color: "border-cyan-200 dark:border-cyan-800",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    accentTop: "from-cyan-400 to-cyan-600",
  },
  {
    name: "Data Analysis",
    slug: "dataanalysis",
    icon: Database,
    description: "Turn raw data into actionable business intelligence",
    features: ["Data collection frameworks", "KPI tracking systems", "Reporting dashboards", "Predictive analytics guides"],
    color: "border-indigo-200 dark:border-indigo-800",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    accentTop: "from-indigo-400 to-indigo-600",
  },
  {
    name: "Marketing",
    slug: "marketing",
    icon: Megaphone,
    description: "Drive growth with proven marketing strategies",
    features: ["Campaign planning playbooks", "Content marketing frameworks", "SEO & paid ads guides", "Brand positioning strategies"],
    color: "border-pink-200 dark:border-pink-800",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    accentTop: "from-pink-400 to-pink-600",
  },
  {
    name: "Operations",
    slug: "operations",
    icon: Settings,
    description: "Streamline processes and maximize efficiency",
    features: ["Process optimization guides", "Supply chain management", "Inventory control systems", "Operational KPI frameworks"],
    color: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    accentTop: "from-orange-400 to-orange-600",
  },
  {
    name: "Business to Business",
    slug: "b2b",
    icon: Handshake,
    description: "Master B2B sales, partnerships, and enterprise deals",
    features: ["B2B sales playbooks", "Partnership frameworks", "Enterprise deal strategies", "Account management guides"],
    color: "border-lime-200 dark:border-lime-800",
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-600 dark:text-lime-400",
    accentTop: "from-lime-400 to-lime-600",
  },
];

const stats = [
  { value: "AI-Powered", label: "Research Engine", icon: Sparkles },
  { value: "Real-Time", label: "Market Data", icon: BarChart3 },
  { value: "15 Categories", label: "Blueprint Topics", icon: Target },
  { value: "24/7", label: "Instant Access", icon: Clock },
];

const faqs = [
  {
    question: "What exactly is a 'Success Blueprint'?",
    answer: "A Success Blueprint is a comprehensive, AI-researched business guide that provides actionable strategies, frameworks, and step-by-step instructions for specific business challenges. Each blueprint is synthesized using real-time market data and proven methodologies, giving you a clear roadmap to implement immediately. Whether you're launching a startup, scaling an existing venture, or pivoting into a new market, these blueprints give you a structured plan built on current intelligence rather than outdated theory. They cover everything from market positioning and customer acquisition to operational workflows and revenue optimization."
  },
  {
    question: "How is AI Blueprint Pulse different from other business courses?",
    answer: "Unlike static courses that become outdated the moment they're published, our blueprints are generated using 5 AI models working together — ChatGPT, Claude, Gemini, Grok, and Perplexity — each analyzing your topic independently before a synthesis step combines their best insights into one consensus-verified report. You get actionable intelligence based on what's working right now, cross-validated across multiple AI perspectives for maximum accuracy. Traditional courses often take months to produce and can cost thousands of dollars. Our platform delivers focused, multi-model-verified guidance in minutes at a fraction of the price. Plus, with our Blueprint Studio, you can generate custom guides tailored to your exact business topic and industry, something no pre-recorded course can offer."
  },
  {
    question: "Do I get lifetime access to purchased blueprints?",
    answer: "Yes! Once you purchase a blueprint from the marketplace, it's yours forever. You can download it as a professionally formatted PDF and access it anytime from your dashboard. There are no recurring fees or subscription requirements for purchased content. The same applies to blueprints you generate through the Blueprint Studio: every DOCX file you create is yours to keep, share, and even resell with full resale rights included. Your purchases and generated content will always be available in your account."
  },
  {
    question: "What's the difference between the categories?",
    answer: "We offer 15 distinct categories designed for different needs and business stages. Free gets you started with essentials. Starter covers fundamentals for new entrepreneurs who are just getting going. Growth provides proven scaling strategies for businesses that have found their footing. Enterprise offers comprehensive playbooks for larger operations managing complex teams and markets. Most Pressing addresses urgent, time-sensitive challenges that need solutions now. Boring but Necessary covers essential compliance, documentation, and operational foundations that every business needs but often overlooks. Pain Points focuses on identifying and solving the biggest frustrations your customers face. Ethical Hacks delivers smart, responsible shortcuts and growth strategies. Trending Use Cases helps you capitalize on hot emerging opportunities before the competition catches on. Power Prompts gives you collections of high-impact AI prompts you can use across your business immediately. Customer Service helps you build outstanding support systems and retention strategies. Data Analysis turns raw data into actionable business intelligence. Marketing provides proven campaign and growth strategies. Operations streamlines your processes for maximum efficiency. And Business to Business covers B2B sales, partnerships, and enterprise deal strategies."
  },
  {
    question: "What are Pain Points blueprints?",
    answer: "Pain Points blueprints are specifically designed to help you understand and solve the biggest challenges your customers are dealing with. Using AI-powered analysis of real customer feedback, reviews, and market data, these blueprints identify the most common frustrations in your industry and provide detailed, actionable solutions. Each guide includes severity ratings, frequency analysis, root cause breakdowns, and practical remedies you can implement right away. They're particularly valuable for product development, customer service improvements, and finding untapped business opportunities hidden in customer complaints."
  },
  {
    question: "What are Ethical Hacks blueprints?",
    answer: "Ethical Hacks blueprints give you smart, creative strategies and responsible shortcuts that give your business a competitive edge without cutting corners on integrity. These aren't shady tricks or grey-hat tactics. They're lesser-known, innovative approaches to common business challenges that most people overlook. Think growth hacking strategies backed by data, unconventional marketing techniques that actually work, and clever operational efficiencies that save time and money. Each blueprint is designed to help you work smarter, not harder, while maintaining your reputation and building trust with your audience."
  },
  {
    question: "What are Trending Use Cases blueprints?",
    answer: "Trending Use Cases blueprints help you get ahead of emerging opportunities before they become mainstream. Our AI research engine continuously monitors market shifts, technology developments, and consumer behavior changes to identify trends that are gaining momentum right now. Each blueprint provides a detailed playbook for capitalizing on these opportunities, including early adopter advantages, market momentum analysis, implementation timelines, and real-world case studies. Whether it's a new application of AI, a shifting consumer preference, or an emerging business model, these guides position you to move fast and capture market share while others are still catching up."
  },
  {
    question: "What are Power Prompts?",
    answer: "Power Prompts are curated collections of high-impact AI prompts specifically crafted for business use. Instead of spending hours figuring out how to get the best results from AI tools, you get ready-to-use prompts tailored to your industry and business topic. Each set covers areas like content generation, customer communication, strategic planning, market analysis, and decision-making frameworks. You can copy them directly into any AI tool you use, and they come as downloadable DOCX files so you always have them on hand. They're designed by our AI research engine to maximize the quality and usefulness of the output you get from AI assistants."
  },
  {
    question: "What are Customer Service blueprints?",
    answer: "Customer Service blueprints give you proven frameworks for delivering outstanding support and building lasting customer loyalty. Each guide covers support workflow optimization, ticket management systems, response templates, escalation procedures, and customer satisfaction measurement. You'll get specific strategies for reducing response times, handling difficult situations, training support teams, and turning unhappy customers into loyal advocates. Whether you're building a support operation from scratch or improving an existing one, these blueprints provide the systems and scripts you need to deliver consistently excellent service."
  },
  {
    question: "What are Data Analysis blueprints?",
    answer: "Data Analysis blueprints help you turn raw business data into clear, actionable intelligence. Each guide walks you through setting up data collection frameworks, building KPI tracking systems, creating meaningful dashboards, and using data to make better business decisions. You'll learn which metrics actually matter for your industry, how to spot trends before your competitors do, and how to present findings in a way that drives action. These blueprints cover everything from basic spreadsheet analytics to more advanced predictive modeling approaches, all written in plain language with step-by-step implementation guides."
  },
  {
    question: "What are Marketing blueprints?",
    answer: "Marketing blueprints provide detailed campaign planning playbooks, content marketing frameworks, SEO and paid advertising guides, and brand positioning strategies. Each guide gives you specific tactics with budget ranges, timeline estimates, and expected results based on current market data. You'll get ready-to-use campaign templates, audience targeting strategies, channel selection frameworks, and measurement systems to track your return on investment. Whether you're running social media campaigns, building email funnels, or launching a brand awareness push, these blueprints give you a tested plan to follow."
  },
  {
    question: "What are Operations blueprints?",
    answer: "Operations blueprints help you streamline your business processes for maximum efficiency and minimum waste. Each guide covers process optimization, supply chain management, inventory control systems, quality assurance frameworks, and operational KPI tracking. You'll get specific workflow diagrams, standard operating procedure templates, resource allocation models, and bottleneck identification techniques. These blueprints are designed for business owners who want to reduce costs, improve throughput, and build systems that scale without breaking down as the business grows."
  },
  {
    question: "What are Business to Business blueprints?",
    answer: "Business to Business blueprints are built for companies that sell to other businesses rather than individual consumers. Each guide covers B2B sales playbooks, partnership development frameworks, enterprise deal strategies, account management systems, and proposal templates. You'll learn how to build a repeatable B2B sales process, negotiate larger contracts, develop strategic partnerships, and manage long sales cycles effectively. These blueprints address the unique challenges of B2B selling, including multi-stakeholder decision making, RFP responses, and building relationships that lead to recurring revenue."
  },
  {
    question: "What is the Blueprint Studio and how does it work?",
    answer: "The Blueprint Studio is your personal blueprint creation tool. Instead of browsing the marketplace for pre-made guides, you can generate a completely custom blueprint on any business topic you choose. Simply pick a topic, select a category and focus area, and our AI engine will research and produce a comprehensive guide in seconds. You download it as a polished Word document with full resale rights included, meaning you can use it in your business, share it with clients, or even sell it as your own product. The Studio also includes Discover and Analyze tools to help you research trending business needs and validate topics before generating."
  },
  {
    question: "How do Blueprint Studio credits work?",
    answer: "Blueprint Studio runs on a simple credit system. Each credit lets you generate one blueprint or one set of Power Prompts. You can purchase credits in three packages: 1 credit for $10, 5 credits for $40 (saving $2 per credit), or 10 credits for $75 (saving $2.50 per credit). Credits never expire and stay in your account until you use them. When you generate a blueprint, one credit is deducted automatically. If something goes wrong during generation, your credit is refunded back to your account. You can check your balance, purchase history, and transaction details anytime in the Credits tab."
  },
  {
    question: "Do I really get full resale rights on generated blueprints?",
    answer: "Yes, absolutely. Every blueprint and Power Prompt set you generate through the Blueprint Studio comes with full resale rights. That means you can use the content in your own business, share it with your team, include it in client packages, bundle it into your own product offerings, or sell it independently under your own brand. The DOCX format makes it easy to customize, rebrand, and repurpose the content however you see fit. Many of our users generate blueprints specifically to sell as digital products, use as lead magnets, or include in their consulting deliverables."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Due to the digital nature of our products, all sales are generally final for marketplace purchases. However, if you believe a blueprint is technically defective or fundamentally fails to address the topic described, we offer a 48-hour correction window where we'll re-run the research or provide a credit for a future guide. For Blueprint Studio credits, if a generation fails for any technical reason, your credit is automatically refunded to your account immediately. We stand behind the quality of our AI research and want every purchase to deliver real value."
  },
  {
    question: "How often is new content added?",
    answer: "We continuously add new blueprints to the marketplace based on market demands and emerging business trends. Our AI research engine is constantly analyzing opportunities across all industries, so you'll see fresh content added regularly across all 15 categories. Beyond the marketplace, the Blueprint Studio lets you generate content on any topic at any time, so you're never limited to what's already available. If there's a niche topic or emerging trend you need a guide for, you can create one yourself in minutes."
  },
  {
    question: "What makes actionable blueprints so powerful?",
    answer: "Actionable blueprints eliminate the gap between knowledge and execution. Instead of generic advice, you get specific steps, templates, frameworks, and implementation timelines tailored to your business stage. Each blueprint is designed so you can start implementing within hours of reading, not weeks of planning. This bias toward action is what separates successful entrepreneurs from those stuck in 'research mode' forever. Our guides include concrete checklists, decision trees, budget templates, and milestone markers so you always know exactly what to do next and how to measure your progress along the way."
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 animate-gradient-shift" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm mb-8">
              <Zap className="h-4 w-4 text-accent" />
              <span>AI-powered business intelligence</span>
            </div>
            
            <h1 className="animate-fade-in-up animation-delay-100 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" data-testid="text-hero-title">
              Transform Your Business
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">With Expert Blueprints</span>
            </h1>
            
            <p className="animate-fade-in-up animation-delay-200 mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
              Actionable business guides powered by 5 AI models working together — ChatGPT, Claude, Gemini, Grok, and Perplexity. 
              From startup fundamentals to enterprise strategies, get consensus-verified intelligence.
            </p>
            
            <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" data-testid="button-explore-marketplace">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/studio">
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-open-studio-hero">
                  <Sparkles className="h-4 w-4" />
                  Blueprint Studio
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button variant="outline" size="lg" asChild data-testid="button-get-started">
                  <a href="/api/login">Get Started Free</a>
                </Button>
              )}
            </div>
            
            <div className="animate-fade-in-up animation-delay-400 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant download</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Full resale rights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>5 AI models combined</span>
              </div>
            </div>

            <div className="animate-fade-in-up animation-delay-400 mt-14 mx-auto max-w-5xl">
              <div className="rounded-xl overflow-hidden border shadow-lg">
                <img
                  src={aiInfographic}
                  alt="Artificial Intelligence - The Good, The Bad and The Ugly - An overview of AI benefits, risks, and concerns"
                  className="w-full h-auto"
                  data-testid="img-ai-infographic"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-y bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3 mx-auto transition-transform duration-300 group-hover:scale-110">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Why Choose Us
              </Badge>
              <h2 className="font-serif text-3xl font-bold">Why AI Blueprint Pulse?</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                We combine cutting-edge AI research with real-world business expertise to create guides that actually work.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title}>
                <Card className={`border-0 bg-gradient-to-br ${feature.gradient} h-full`}>
                  <CardContent className="pt-8 pb-8">
                    <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm`}>
                      <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-3 py-1">
                <Target className="h-3 w-3 mr-1.5" />
                15 Specialized Categories
              </Badge>
              <h2 className="font-serif text-3xl font-bold">Choose Your Path</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Whether you're just starting out or leading an enterprise, we have the right blueprint for you.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <ScrollReveal key={tier.name}>
                <Card 
                  className={`relative h-full ${tier.color} ${tier.popular ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-md bg-gradient-to-r ${tier.accentTop}`} />
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 relative overflow-hidden" id="credits">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/3 via-transparent to-primary/3" />
        <div className="container relative">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 px-3 py-1">
                  <Coins className="h-3 w-3 mr-1.5" />
                  Blueprint Studio
                </Badge>
                <h2 className="font-serif text-3xl font-bold">
                  Create Custom Blueprints
                </h2>
                <p className="mt-2 text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Build Your Own — on any topic, in seconds
                </p>
                <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                  Use credits to generate a fully custom business blueprint tailored to your exact needs. Pick any topic, choose a category, and our AI engine delivers a polished Word document with full resale rights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "single", credits: 1, price: "$10", perCredit: "$10.00", label: "Starter", desc: "Try it out", gradient: "from-slate-500/5 to-slate-500/10" },
                  { id: "five", credits: 5, price: "$40", perCredit: "$8.00", label: "Popular", desc: "Best for growing businesses", popular: true, gradient: "from-primary/5 to-accent/10" },
                  { id: "ten", credits: 10, price: "$75", perCredit: "$7.50", label: "Best Value", desc: "Maximum savings", gradient: "from-emerald-500/5 to-emerald-500/10" },
                ].map((pkg) => (
                  <Card key={pkg.id} className={`relative ${pkg.popular ? "border-primary/50 ring-1 ring-primary/20" : ""}`} data-testid={`card-landing-package-${pkg.id}`}>
                    <div className={`absolute inset-0 rounded-md bg-gradient-to-b ${pkg.gradient} pointer-events-none`} />
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="relative p-6 text-center space-y-4 pt-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{pkg.label}</p>
                        <p className="text-4xl font-bold text-foreground mt-1">{pkg.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pkg.perCredit} per blueprint</p>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{pkg.credits} Blueprint Credit{pkg.credits > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>Full Resale Rights</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>DOCX Download</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{pkg.desc}</span>
                        </div>
                      </div>
                      <Link href="/studio?tab=credits">
                        <Button
                          className="w-full"
                          variant={pkg.popular ? "default" : "outline"}
                          data-testid={`button-landing-purchase-${pkg.id}`}
                        >
                          <CreditCard className="h-4 w-4 mr-1.5" />
                          Get Credits
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link href="/studio">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-open-studio">
                    <Sparkles className="h-4 w-4" />
                    Open Blueprint Studio
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-14 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 px-3 py-1">
                  <HelpCircle className="h-3 w-3 mr-1.5" />
                  FAQ
                </Badge>
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
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-gradient-shift" />
        <div className="container relative">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-6 animate-float">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">Ready to Accelerate Your Success?</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Join action-taking entrepreneurs and business leaders who have transformed their operations with our blueprints.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2" data-testid="button-cta-marketplace">
                    Start Browsing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/studio">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-cta-studio">
                    <Sparkles className="h-4 w-4" />
                    Create a Blueprint
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
