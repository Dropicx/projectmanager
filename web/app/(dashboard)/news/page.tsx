"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContentGrid,
  EmptyState,
  FilterBar,
  type FilterOption,
  type FroxStatCardProps,
  MetricsGrid,
  PageContainer,
  type ViewMode,
} from "@consulting-platform/ui";
import { format } from "date-fns";
import {
  CalendarDays,
  ExternalLink,
  Eye,
  Loader2,
  Newspaper,
  RefreshCw,
  Tag,
  Target,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

type NewsCategory = "all" | "general" | "security" | "citizen";

const _categoryLabels: Record<NewsCategory, string> = {
  all: "All Categories",
  general: "General IT News",
  security: "Security Advisories",
  citizen: "Citizen Security",
};

// Helper function to extract and style security classification
const getSecurityClassification = (title: string) => {
  const niedrigMatch = /\bniedrig\b/i.test(title);
  const mittelMatch = /\bmittel\b/i.test(title);
  const hochMatch = /\bhoch\b/i.test(title);
  const lowMatch = /\blow\b/i.test(title);
  const mediumMatch = /\bmedium\b|\bmoderate\b/i.test(title);
  const highMatch = /\bhigh\b|\bcritical\b/i.test(title);

  if (hochMatch || highMatch) {
    return {
      level: "high",
      label: hochMatch ? "Hoch" : "High",
      className: "bg-red-accent/10 text-red-accent border-red-accent",
      borderClassName: "border-l-4 border-red-accent",
    };
  }
  if (mittelMatch || mediumMatch) {
    return {
      level: "medium",
      label: mittelMatch ? "Mittel" : "Medium",
      className: "bg-orange-accent/10 text-orange-accent border-orange-accent",
      borderClassName: "border-l-4 border-orange-accent",
    };
  }
  if (niedrigMatch || lowMatch) {
    return {
      level: "low",
      label: niedrigMatch ? "Niedrig" : "Low",
      className: "bg-green-accent/10 text-green-accent border-green-accent",
      borderClassName: "border-l-4 border-green-accent",
    };
  }
  return null;
};

export default function NewsPage() {
  const [daysBack, setDaysBack] = useState(1);
  const [selectedCategory, _setSelectedCategory] = useState<NewsCategory>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    data: articles = [],
    isLoading,
    refetch,
  } = trpc.news.getRecentNews.useQuery({
    daysBack,
    category: selectedCategory,
  });

  const { data: feedCategories = [] } = trpc.news.getFeedCategories.useQuery();

  const stripHtml = useCallback((html: string): string => {
    let text = html.replace(/<[^>]*>/g, "");
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  }, []);

  const { mutate: syncRssFeed, isPending: isSyncing } = trpc.news.syncRssFeed.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!articles || !debouncedSearchQuery) return articles;

    const query = debouncedSearchQuery.toLowerCase();
    return articles.filter((article) => {
      const title = article.title?.toLowerCase() || "";
      const description = stripHtml(article.description || "").toLowerCase();
      const content = stripHtml(article.content || "").toLowerCase();
      const author = article.author?.toLowerCase() || "";
      const categories = (article.categories as string[])?.join(" ").toLowerCase() || "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        content.includes(query) ||
        author.includes(query) ||
        categories.includes(query)
      );
    });
  }, [articles, debouncedSearchQuery, stripHtml]);

  // Calculate metrics for FroxStatCards
  const metrics = useMemo((): FroxStatCardProps[] => {
    const todayArticles = articles.filter((article) => {
      const publishedDate = new Date(article.published_at);
      const today = new Date();
      return publishedDate.toDateString() === today.toDateString();
    });

    const uniqueCategories = new Set(articles.flatMap((article) => article.categories || []));

    const avgRelevanceScore = 8.2; // Placeholder for Phase 2 AI scoring

    return [
      {
        value: todayArticles.length,
        label: "Articles Today",
        icon: Newspaper,
        iconBgColor: "blue",
        trend: todayArticles.length > 0 ? "up" : undefined,
        trendValue: todayArticles.length > 0 ? `+${todayArticles.length}` : undefined,
      },
      {
        value: uniqueCategories.size,
        label: "Categories",
        icon: Tag,
        iconBgColor: "green",
      },
      {
        value: "67%",
        label: "Read Rate",
        icon: Eye,
        iconBgColor: "violet",
        trend: "up",
        trendValue: "+12%",
      },
      {
        value: avgRelevanceScore.toFixed(1),
        label: "Relevance Score",
        icon: Target,
        iconBgColor: "orange",
        trend: "up",
        trendValue: "Preparing AI",
        dropdownActions: [
          {
            id: "about",
            label: "About Relevance",
            onClick: () => console.log("AI relevance info"),
          },
        ],
      },
    ];
  }, [articles]);

  // Quick filters for time range
  const quickFilters: FilterOption[] = [
    {
      id: "1",
      label: "Today",
      count: articles.filter((a) => {
        const publishedDate = new Date(a.published_at);
        const today = new Date();
        return publishedDate.toDateString() === today.toDateString();
      }).length,
      active: daysBack === 1,
    },
    {
      id: "3",
      label: "3 Days",
      active: daysBack === 3,
    },
    {
      id: "7",
      label: "Week",
      active: daysBack === 7,
    },
  ];

  // Render news article card
  const renderArticleCard = (article: any, _index: number, mode: ViewMode) => {
    const securityClass = getSecurityClassification(article.title);
    const isSecurityAdvisory =
      article.metadata?.feed_category === "security" ||
      article.metadata?.feed_category === "citizen";

    // Grid View Card
    if (mode === "grid") {
      return (
        <Card
          key={article.id}
          className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-sky-accent dark:hover:border-sky-accent overflow-hidden flex flex-col ${
            isSecurityAdvisory && securityClass ? securityClass.borderClassName : ""
          }`}
        >
          {(article.image_url || article.thumbnail_url) && (
            <div className="relative h-48 w-full bg-gray-200 dark:bg-dark-gray-200">
              <Image
                src={article.image_url || article.thumbnail_url || ""}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (article.thumbnail_url && target.src !== article.thumbnail_url) {
                    target.src = article.thumbnail_url;
                  } else {
                    const container = target.parentElement;
                    if (container) container.style.display = "none";
                  }
                }}
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 line-clamp-2 flex-1 group-hover:text-sky-accent transition-colors">
                {article.title}
              </CardTitle>
              {isSecurityAdvisory && securityClass && (
                <Badge className={`text-xs font-semibold border ${securityClass.className}`}>
                  {securityClass.label}
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-dark-500">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(article.published_at), "MMM d, yyyy")}
              {article.metadata?.feed_category_name && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {article.metadata.feed_category_name as string}
                  </Badge>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {(article.content || article.description) && (
              <p className="text-sm text-gray-600 dark:text-gray-dark-600 mb-4 line-clamp-3">
                {stripHtml(article.content || article.description || "")}
              </p>
            )}
            {article.categories &&
              Array.isArray(article.categories) &&
              article.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(article.categories as string[]).slice(0, 3).map((category, idx) => (
                    <Badge key={`${article.id}-${idx}`} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-accent hover:underline"
            >
              Read Full Article
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      );
    }

    // List View Card
    return (
      <Card
        key={article.id}
        className={`hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-sky-accent dark:hover:border-sky-accent ${
          isSecurityAdvisory && securityClass ? securityClass.borderClassName : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {(article.image_url || article.thumbnail_url) && (
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-dark-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={article.image_url || article.thumbnail_url || ""}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (article.thumbnail_url && target.src !== article.thumbnail_url) {
                      target.src = article.thumbnail_url;
                    } else {
                      const container = target.parentElement;
                      if (container) container.style.display = "none";
                    }
                  }}
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-header-7 font-semibold text-gray-1100 dark:text-gray-dark-1100 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-dark-600 mt-1 line-clamp-2">
                    {stripHtml(article.content || article.description || "")}
                  </p>
                </div>
                {isSecurityAdvisory && securityClass && (
                  <Badge className={`text-xs ml-4 border ${securityClass.className}`}>
                    {securityClass.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-dark-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(article.published_at), "MMM d, yyyy")}
                </span>
                {article.metadata?.feed_category_name && (
                  <Badge variant="secondary" className="text-xs">
                    {article.metadata.feed_category_name as string}
                  </Badge>
                )}
                {article.categories &&
                  Array.isArray(article.categories) &&
                  article.categories.length > 0 && (
                    <div className="flex gap-1">
                      {(article.categories as string[]).slice(0, 2).map((category, idx) => (
                        <Badge key={`${article.id}-${idx}`} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-accent hover:underline"
              >
                Read Full Article
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer
      breadcrumbs={[
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        { id: "news", label: "News Feed", href: "/news" },
      ]}
      title="News Feed"
      description="Stay updated with the latest IT news and security advisories"
      actions={
        <Button
          onClick={() => syncRssFeed({ category: selectedCategory })}
          disabled={isSyncing}
          variant="outline"
        >
          {isSyncing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isSyncing ? "Syncing..." : "Sync Feeds"}
        </Button>
      }
    >
      {/* Metrics Dashboard */}
      <MetricsGrid metrics={metrics} columns={4} />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search articles..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilters={quickFilters}
        onQuickFilterClick={(id) => setDaysBack(parseInt(id, 10))}
        viewModes={["grid", "list"]}
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sky-accent" />
        </div>
      ) : (
        <ContentGrid
          items={filteredArticles}
          viewMode={viewMode}
          renderCard={(article, index) => renderArticleCard(article, index, viewMode)}
          gridColumns={3}
          emptyState={
            <EmptyState
              icon={Newspaper}
              title="No articles found"
              description={
                debouncedSearchQuery
                  ? "Try different keywords or clear your search"
                  : "Try refreshing the feed or adjusting the date range"
              }
            />
          }
        />
      )}
    </PageContainer>
  );
}
