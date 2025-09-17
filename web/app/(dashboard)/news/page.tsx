"use client";

import { Button } from "@consulting-platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@consulting-platform/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@consulting-platform/ui/components/dropdown-menu";
import { Skeleton } from "@consulting-platform/ui/components/skeleton";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

type NewsCategory = "all" | "general" | "security" | "citizen";

const categoryLabels: Record<NewsCategory, string> = {
  all: "All Categories",
  general: "General IT News",
  security: "Security Advisories",
  citizen: "Citizen Security",
};

export default function NewsPage() {
  const [daysBack, setDaysBack] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("general");

  const {
    data: articles,
    isLoading,
    refetch,
  } = trpc.news.getRecentNews.useQuery({
    daysBack,
    category: selectedCategory,
  });

  const { data: feedCategories } = trpc.news.getFeedCategories.useQuery();

  // Function to strip HTML tags and clean up content
  const stripHtml = (html: string): string => {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, "");
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Remove extra whitespace
    text = text.replace(/\s+/g, " ").trim();
    return text;
  };

  const { mutate: syncRssFeed, isPending: isSyncing } = trpc.news.syncRssFeed.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRefresh = () => {
    syncRssFeed({ category: selectedCategory });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">News Feed</h1>
          <p className="text-muted-foreground mt-2">Loading latest articles...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
            <Card key={`skeleton-card-${num}`}>
              <CardHeader>
                <Skeleton className="h-48 w-full rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Newspaper className="h-8 w-8" />
              News Feed
            </h1>
            <p className="text-muted-foreground mt-2">
              {selectedCategory === "all"
                ? `Displaying all articles from the last ${daysBack} days`
                : `Displaying ${categoryLabels[selectedCategory]} from the last ${daysBack} days`}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Category Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {categoryLabels[selectedCategory]}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                  <div className="flex flex-col">
                    <span className="font-medium">All Categories</span>
                    <span className="text-xs text-muted-foreground">Show all news sources</span>
                  </div>
                </DropdownMenuItem>
                {feedCategories?.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as NewsCategory)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">{category.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Range Buttons */}
            <Button
              variant={daysBack === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setDaysBack(1)}
            >
              Today
            </Button>
            <Button
              variant={daysBack === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => setDaysBack(3)}
            >
              3 Days
            </Button>
            <Button
              variant={daysBack === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDaysBack(7)}
            >
              Week
            </Button>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {articles?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No articles found</p>
            <p className="text-muted-foreground">
              Try refreshing the feed or adjusting the date range
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
          {articles?.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              {(article.image_url || article.thumbnail_url) && (
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={article.image_url || article.thumbnail_url || ""}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      // Try thumbnail as fallback
                      const target = e.target as HTMLImageElement;
                      if (article.thumbnail_url && target.src !== article.thumbnail_url) {
                        target.src = article.thumbnail_url;
                      } else {
                        // Hide image container if both fail
                        const container = target.parentElement;
                        if (container) container.style.display = "none";
                      }
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(article.published_at), "MMM d, yyyy h:mm a")}
                  {article.metadata?.feed_category_name && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                        {article.metadata.feed_category_name as string}
                      </span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Show cleaned content or description */}
                {(article.content || article.description) && (
                  <div className="text-sm text-muted-foreground mb-4">
                    <p className="line-clamp-[12] min-h-[12rem]">
                      {stripHtml(article.content || article.description || "")}
                    </p>
                  </div>
                )}
                {article.author && (
                  <p className="text-xs text-muted-foreground mb-2">By {article.author}</p>
                )}
                {article.categories && article.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(article.categories as string[]).slice(0, 3).map((category, idx) => (
                      <span
                        key={`${article.id}-category-${idx}`}
                        className="text-xs bg-secondary px-2 py-1 rounded-md"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read Full Article
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
