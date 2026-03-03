import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Search, FileText, MapPin, Sparkles } from "lucide-react";
import { SEO, BreadcrumbSchema } from "@/components/seo";

export default function AboutPage() {
  return (
    <div className="py-8">
      <SEO
        title="About"
        description="Learn about AI Blueprint Pulse - an AI-powered business intelligence platform built by a solo founder using multi-model AI research across 24 industry verticals."
        path="/about"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "About", url: "/about" }]} />
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">About the Founder</Badge>
          <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-page-title">
            I build the systems that help entrepreneurs stop guessing and start scaling.
          </h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              With a background as both a web developer and a published author, I've spent my career 
              at the intersection of complex technical architecture and clear, impactful storytelling. 
              I believe that in the 2026 digital economy, the biggest hurdle for founders isn't a lack 
              of information—it's a lack of <strong>current context</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Most business advice is outdated by the time it reaches your screen. That's why I built 
              <strong> AI Blueprint Pulse</strong>: a research-driven SaaS that utilizes real-time AI synthesis 
              to provide concise, actionable roadmaps for businesses at every level—from hungry beginners 
              to enterprise-scale operations.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">My Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To bridge the gap between "Big Data" and "Big Results" by providing entrepreneurs with 
              the technical logic and strategic blueprints they need to build sustainable online empires.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6">Core Expertise</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Full-Stack Development</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Specialized in AI-agentic workflows and SaaS architecture.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Strategic Research</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Leveraging LLM-driven market analysis to identify untapped niche opportunities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Content Architecture</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming complex technical data into high-readability briefings and published works.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Based in the Pacific Northwest</span>
            </div>
            <p className="leading-relaxed">
              I am dedicated to building high-leverage tools that level the playing field for the 
              modern digital founder.
            </p>
          </CardContent>
        </Card>

        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-2">
            Let's connect if you're interested in AI-ops, automation, or the future of data-driven entrepreneurship.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2026 AI Blueprint Pulse. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
