import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, UserIcon } from "lucide-react";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" data-testid="text-blog-not-found">Post not found</h2>
        <p className="text-muted-foreground mb-6">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/blog")} data-testid="button-back-to-blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="py-8">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/blog")}
            className="mb-6"
            data-testid="button-back-to-blog"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {post.coverImageUrl && (
            <div className="rounded-md overflow-hidden mb-6">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-64 object-cover"
                data-testid="img-blog-cover"
              />
            </div>
          )}

          <Badge variant="secondary" className="mb-4" data-testid="badge-blog-category">
            {post.category}
          </Badge>

          <h1
            className="font-serif text-3xl lg:text-4xl font-bold mb-4"
            data-testid="text-blog-title"
          >
            {post.title}
          </h1>

          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5" data-testid="text-blog-author">
              <UserIcon className="h-4 w-4" />
              {post.authorName}
            </span>
            {publishedDate && (
              <span className="flex items-center gap-1.5" data-testid="text-blog-date">
                <Calendar className="h-4 w-4" />
                {publishedDate}
              </span>
            )}
          </div>

          <Card>
            <CardContent className="py-8">
              <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-li:text-base">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
