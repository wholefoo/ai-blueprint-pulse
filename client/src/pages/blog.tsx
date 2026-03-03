import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, ArrowRight, Newspaper } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { SEO, BreadcrumbSchema } from "@/components/seo";

const categoryColors: Record<string, string> = {
  "AI & Automation": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "Marketing": "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  "Strategy": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "Operations": "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "Growth": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Leadership": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Technology": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "Sales": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "Finance": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
};

function getCategoryStyle(category: string) {
  return categoryColors[category] || "bg-muted text-muted-foreground";
}

function formatDate(date: string | Date | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="py-8">
      <SEO
        title="Blog - Insights & Intelligence"
        description="AI-generated business insights, market analysis, and actionable strategies. Expert articles on marketing, growth, AI automation, and more."
        path="/blog"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }]} />
      <div className="container">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-3xl font-bold" data-testid="text-blog-title">
              Blog
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Expert insights, AI strategies, and actionable business intelligence to help you stay ahead.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className="toggle-elevate"
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2" data-testid="text-no-posts">No posts yet</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== "All"
                ? "No posts found in this category. Try selecting a different one."
                : "Check back soon for new articles and insights."}
            </p>
            {selectedCategory !== "All" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSelectedCategory("All")}
                data-testid="button-clear-category"
              >
                Show all posts
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-post-count">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card
                    className="h-full flex flex-col hover-elevate cursor-pointer overflow-visible"
                    data-testid={`card-blog-post-${post.id}`}
                  >
                    {post.coverImageUrl && (
                      <div className="relative overflow-hidden rounded-t-md">
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                          data-testid={`img-cover-${post.id}`}
                        />
                      </div>
                    )}
                    <CardContent className={`flex flex-col flex-1 gap-3 ${post.coverImageUrl ? "pt-4" : "pt-6"} pb-6`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getCategoryStyle(post.category)}`}
                          data-testid={`badge-category-${post.id}`}
                        >
                          {post.category}
                        </Badge>
                        {post.publishedAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif font-semibold text-lg leading-snug line-clamp-2" data-testid={`text-title-${post.id}`}>
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1" data-testid={`text-excerpt-${post.id}`}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium text-accent mt-auto pt-2">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
