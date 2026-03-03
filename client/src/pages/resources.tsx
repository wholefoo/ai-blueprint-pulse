import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, BookOpen, ArrowRight } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  pages: string;
  category: string;
  format: string;
  downloadUrl: string;
  topics: string[];
}

export default function ResourcesPage() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-4" data-testid="badge-resources">
            <BookOpen className="h-3 w-3 mr-1" />
            Free Resources
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4" data-testid="text-resources-title">
            Free Business Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-resources-subtitle">
            Download our comprehensive guides, playbooks, and toolkits — built with the same
            AI-powered research engine that powers our premium blueprints.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container max-w-5xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : resources && resources.length > 0 ? (
            <div className="space-y-8">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden border-2 hover:border-primary/30 transition-colors" data-testid={`card-resource-${resource.id}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-64 bg-gradient-to-br from-primary to-primary/80 p-8 flex flex-col items-center justify-center text-primary-foreground">
                        <FileText className="h-16 w-16 mb-4 opacity-90" />
                        <span className="text-sm font-medium uppercase tracking-wider opacity-80">{resource.format}</span>
                        <span className="text-3xl font-bold mt-1">{resource.pages}</span>
                        <span className="text-sm opacity-80">Pages</span>
                      </div>

                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <Badge variant="secondary" className="mb-2">{resource.category}</Badge>
                            <h2 className="text-xl lg:text-2xl font-bold text-foreground" data-testid={`text-resource-title-${resource.id}`}>
                              {resource.title}
                            </h2>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-5 leading-relaxed" data-testid={`text-resource-desc-${resource.id}`}>
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6" data-testid={`topics-${resource.id}`}>
                          {resource.topics.map((topic, idx) => (
                            <Badge key={topic} variant="outline" className="text-xs" data-testid={`badge-topic-${resource.id}-${idx}`}>
                              {topic}
                            </Badge>
                          ))}
                        </div>

                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          data-testid={`button-download-${resource.id}`}
                        >
                          <Button size="lg" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Free Guide
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2" data-testid="text-no-resources">No resources available yet</h3>
              <p className="text-muted-foreground">Check back soon for free guides and toolkits.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
