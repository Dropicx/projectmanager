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
import {
  BookOpen,
  Calendar,
  Database,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { AddKnowledgeDialog } from "@/components/knowledge/add-knowledge-dialog";
import { KnowledgeDetailView } from "@/components/knowledge/knowledge-detail-view";
import { KnowledgeSidebar } from "@/components/knowledge-sidebar";
import { getContentExcerpt } from "@/lib/html-utils";

export const dynamic = "force-dynamic";

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch knowledge items from API
  const {
    data: knowledgeItems = [],
    isLoading,
    refetch,
  } = trpc.knowledge.list.useQuery({
    search: debouncedSearch || undefined,
    categoryId: selectedCategory,
    type: "all",
    limit: 100,
  });

  // Fetch categories
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  // Generate summaries mutation
  const generateSummaries = trpc.knowledge.generateBatchSummaries.useMutation({
    onSuccess: () => {
      setTimeout(() => refetch(), 3000);
      setTimeout(() => refetch(), 8000);
    },
  });

  // Items without summary (defined before metrics to avoid reference errors)
  const itemsWithoutSummary = knowledgeItems.filter((item: any) => !item.summary);

  const handleGenerateSummaries = useCallback(() => {
    const idsToGenerate = itemsWithoutSummary.slice(0, 10).map((item: any) => item.id);
    generateSummaries.mutate({ knowledgeIds: idsToGenerate });
  }, [itemsWithoutSummary, generateSummaries]);

  // Calculate metrics for FroxStatCards
  const metrics = useMemo((): FroxStatCardProps[] => {
    const totalItems = knowledgeItems.length;
    const itemsWithSummary = knowledgeItems.filter((item: any) => item.summary).length;
    const summaryCompletionRate =
      totalItems > 0 ? Math.round((itemsWithSummary / totalItems) * 100) : 0;

    // Calculate this week's items (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekItems = knowledgeItems.filter((item) => new Date(item.createdAt) >= oneWeekAgo);

    return [
      {
        value: totalItems,
        label: "Total Knowledge",
        icon: Database,
        iconBgColor: "blue",
        trend: "up",
        trendValue: "12%",
        dropdownActions: [
          {
            id: "export",
            label: "Export All",
            onClick: () => console.log("Export all"),
          },
          {
            id: "report",
            label: "Generate Report",
            onClick: () => console.log("Generate report"),
          },
        ],
      },
      {
        value: thisWeekItems.length,
        label: "This Week",
        icon: Calendar,
        iconBgColor: "green",
        trend: thisWeekItems.length > 0 ? "up" : undefined,
        trendValue: thisWeekItems.length > 0 ? `+${thisWeekItems.length}` : undefined,
      },
      {
        value: categories.length,
        label: "Categories",
        icon: FolderOpen,
        iconBgColor: "violet",
      },
      {
        value: `${summaryCompletionRate}%`,
        label: "AI Summaries",
        icon: Sparkles,
        iconBgColor: "orange",
        trend: summaryCompletionRate > 50 ? "up" : "down",
        trendValue: `${itemsWithoutSummary.length} pending`,
        dropdownActions:
          itemsWithoutSummary.length > 0
            ? [
                {
                  id: "generate",
                  label: "Generate Summaries",
                  onClick: handleGenerateSummaries,
                },
              ]
            : undefined,
      },
    ];
  }, [knowledgeItems, categories, itemsWithoutSummary, handleGenerateSummaries]);

  // Quick filters
  const quickFilters: FilterOption[] = [
    {
      id: "all",
      label: "All",
      count: knowledgeItems.length,
      active: activeFilter === "all",
    },
    {
      id: "notes",
      label: "Notes",
      count: knowledgeItems.filter((item: any) => item.type === "pattern").length,
      active: activeFilter === "notes",
    },
    {
      id: "templates",
      label: "Templates",
      count: knowledgeItems.filter((item: any) => item.type === "template").length,
      active: activeFilter === "templates",
    },
  ];

  // Map backend type to frontend display type
  const mapBackendType = (type: string): string => {
    const typeMap: Record<string, string> = {
      pattern: "methodology",
      template: "template",
      reference: "guide",
      solution: "framework",
      decision: "checklist",
      insight: "case-study",
      issue: "framework",
      lesson_learned: "case-study",
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const displayType = mapBackendType(type);
    const icons: Record<string, typeof BookOpen> = {
      methodology: BookOpen,
      framework: FileText,
      template: FileText,
      "case-study": BookOpen,
      guide: BookOpen,
      checklist: FileText,
    };
    return icons[displayType] || FileText;
  };

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    const displayType = mapBackendType(type);
    const colors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      methodology: "default",
      framework: "secondary",
      template: "outline",
      "case-study": "default",
      guide: "default",
      checklist: "secondary",
    };
    return colors[displayType] || "default";
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Render knowledge card based on view mode
  const renderKnowledgeCard = (item, _index: number, mode: ViewMode) => {
    const Icon = getTypeIcon(item.type || "guide");
    const displayType = mapBackendType(item.type || "guide");

    // Grid View Card
    if (mode === "grid") {
      return (
        <Card
          key={item.id}
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-blue-accent dark:hover:border-blue-accent"
          onClick={() => setSelectedKnowledgeId(item.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="rounded-lg bg-blue-accent/10 p-2">
                <Icon className="h-5 w-5 text-blue-accent" />
              </div>
              <Badge variant={getTypeColor(item.type || "guide")} className="text-xs">
                {displayType}
              </Badge>
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 group-hover:text-blue-accent transition-colors">
              {item.title}
            </CardTitle>
            <CardDescription className="text-desc text-gray-600 dark:text-gray-dark-600 line-clamp-3">
              {item.summary ? (
                <span className="flex items-start gap-1">
                  <Sparkles className="h-3 w-3 text-orange-accent mt-0.5 flex-shrink-0" />
                  <span>{item.summary}</span>
                </span>
              ) : (
                getContentExcerpt(item.content || "", 150)
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(item.tags as string[]).slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-dark-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // List View Card
    if (mode === "list") {
      return (
        <Card
          key={item.id}
          className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-blue-accent dark:hover:border-blue-accent"
          onClick={() => setSelectedKnowledgeId(item.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-accent/10 p-2 mt-1">
                <Icon className="h-5 w-5 text-blue-accent" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-header-7 font-semibold text-gray-1100 dark:text-gray-dark-1100">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-dark-600 mt-1 line-clamp-2">
                      {item.summary ? (
                        <span className="flex items-start gap-1">
                          <Sparkles className="h-3 w-3 text-orange-accent mt-0.5 flex-shrink-0" />
                          <span>{item.summary}</span>
                        </span>
                      ) : (
                        getContentExcerpt(item.content || "", 120)
                      )}
                    </p>
                  </div>
                  <Badge variant={getTypeColor(item.type || "guide")} className="text-xs ml-4">
                    {displayType}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-dark-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {item.views || 0} views
                  </span>
                  {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex gap-1">
                      {(item.tags as string[]).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Timeline View Card
    return (
      <Card
        key={item.id}
        className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-dark-neutral-border"
        onClick={() => setSelectedKnowledgeId(item.id)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-blue-accent mt-0.5" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h4 className="text-normal font-medium text-gray-900 dark:text-gray-dark-900">
                  {item.title}
                </h4>
                <Badge variant={getTypeColor(item.type || "guide")} className="text-xs">
                  {displayType}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-dark-600 mt-1 line-clamp-2">
                {item.summary ? (
                  <span className="flex items-start gap-1">
                    <Sparkles className="h-3 w-3 text-orange-accent mt-0.5 flex-shrink-0" />
                    <span>{item.summary}</span>
                  </span>
                ) : (
                  getContentExcerpt(item.content || "", 100)
                )}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-dark-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.views || 0}
                </span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter knowledge items based on active filter
  const filteredItems = knowledgeItems.filter((item: any) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "notes") return item.type === "pattern";
    if (activeFilter === "templates") return item.type === "template";
    return true;
  });

  // If viewing detail, show detail view
  if (selectedKnowledgeId) {
    return (
      <div className="lg:-m-6 flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)]">
        <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-dark-neutral-border bg-white dark:bg-dark-neutral-bg flex-shrink-0">
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <KnowledgeSidebar
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                onSearch={setSearchQuery}
              />
            </div>
          </div>
        </aside>
        <main className="flex-1 bg-gray-100 dark:bg-dark-gray-100">
          <div className="h-full overflow-y-auto">
            <div className="p-6 lg:p-6">
              <KnowledgeDetailView
                knowledgeId={selectedKnowledgeId}
                onBack={() => setSelectedKnowledgeId(null)}
                onDelete={() => {
                  setSelectedKnowledgeId(null);
                  refetch();
                }}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="lg:-m-6 flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)]">
      {/* Knowledge Sidebar - Fixed left sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-dark-neutral-border bg-white dark:bg-dark-neutral-bg flex-shrink-0">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <KnowledgeSidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              onSearch={setSearchQuery}
            />
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 bg-gray-100 dark:bg-dark-gray-100">
        <div className="h-full overflow-y-auto">
          <div className="p-6 lg:p-6">
            <PageContainer
              breadcrumbs={[
                { id: "dashboard", label: "Dashboard", href: "/dashboard" },
                { id: "knowledge", label: "Knowledge Base", href: "/knowledge" },
              ]}
              title="Knowledge Base"
              description="Your personal knowledge command center"
              actions={
                <Button onClick={() => setAddDialogOpen(true)} size="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Knowledge
                </Button>
              }
            >
              {/* Metrics Dashboard */}
              <MetricsGrid metrics={metrics} columns={4} />

              {/* Filter Bar */}
              <FilterBar
                searchPlaceholder="Search knowledge base..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                quickFilters={quickFilters}
                onQuickFilterClick={setActiveFilter}
                viewModes={["grid", "list", "timeline"]}
                currentView={viewMode}
                onViewChange={setViewMode}
                actions={
                  itemsWithoutSummary.length > 0 ? (
                    <Button
                      onClick={handleGenerateSummaries}
                      variant="outline"
                      size="sm"
                      disabled={generateSummaries.isPending}
                    >
                      {generateSummaries.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Generate Summaries
                    </Button>
                  ) : null
                }
              />

              {/* Content Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-accent" />
                </div>
              ) : (
                <ContentGrid
                  items={filteredItems}
                  viewMode={viewMode}
                  renderCard={(item, index) => renderKnowledgeCard(item, index, viewMode)}
                  gridColumns={3}
                  emptyState={
                    <EmptyState
                      icon={BookOpen}
                      title="No knowledge items found"
                      description={
                        searchQuery
                          ? "Try adjusting your search or filters"
                          : "Start building your knowledge base by adding your first item"
                      }
                      action={
                        !searchQuery ? (
                          <Button onClick={() => setAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Knowledge
                          </Button>
                        ) : undefined
                      }
                    />
                  }
                />
              )}
            </PageContainer>

            <AddKnowledgeDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onSuccess={() => refetch()}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
