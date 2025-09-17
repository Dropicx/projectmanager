"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@consulting-platform/ui";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  FileText,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { AddKnowledgeDialog } from "@/components/knowledge/add-knowledge-dialog";
import { KnowledgeSidebar } from "@/components/knowledge-sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

export const dynamic = "force-dynamic";

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch knowledge items from API
  const { data: knowledgeItems = [], isLoading } = trpc.knowledge.list.useQuery({
    search: debouncedSearch || undefined,
    categoryId: selectedCategory,
    type: "all",
    limit: 50,
  });

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

  const getTypeColor = (type: string) => {
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

  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (knowledgeItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No knowledge items found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Start by adding your first knowledge item"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeItems.map((item) => {
          const Icon = getTypeIcon(item.type || "guide");
          const displayType = mapBackendType(item.type || "guide");
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge variant={getTypeColor(item.type || "guide")} className="text-xs">
                    {displayType}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="line-clamp-3">{item.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {(item.tags as string[]).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views || 0}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.createdAt ? formatDate(item.createdAt) : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (knowledgeItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No knowledge items found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Start by adding your first knowledge item"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {knowledgeItems.map((item) => {
          const Icon = getTypeIcon(item.type || "guide");
          const displayType = mapBackendType(item.type || "guide");
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Icon className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                      </div>
                      <Badge variant={getTypeColor(item.type || "guide")} className="text-xs ml-4">
                        {displayType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.createdAt ? formatDate(item.createdAt) : "N/A"}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views || 0} views
                      </span>
                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? (
                        <div className="flex gap-1">
                          {(item.tags as string[]).slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (knowledgeItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No knowledge items found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Start by adding your first knowledge item"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge
            </Button>
          )}
        </div>
      );
    }

    const groupedByDate = knowledgeItems.reduce(
      (acc, item) => {
        const date = item.createdAt ? formatDate(item.createdAt) : "Unknown";
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, typeof knowledgeItems>
    );

    return (
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-muted-foreground">{date}</h3>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3 ml-7">
              {items.map((item: any) => {
                const Icon = getTypeIcon(item.type || "guide");
                const displayType = mapBackendType(item.type || "guide");
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <Badge variant={getTypeColor(item.type || "guide")} className="text-xs">
                              {displayType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{item.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="flex h-full bg-white">
        <aside
          className={cn(
            "border-r flex-shrink-0 transition-all duration-300 bg-background",
            isSidebarOpen ? "w-64" : "w-0",
            "lg:w-64 lg:overflow-visible"
          )}
        >
          <KnowledgeSidebar
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onSearch={setSearchQuery}
          />
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <List className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : `${knowledgeItems?.length || 0} items`}{" "}
                    {selectedCategory && "in category"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Knowledge
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "grid" | "list" | "timeline")}
              >
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Clock className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              {viewMode === "grid" && renderGridView()}
              {viewMode === "list" && renderListView()}
              {viewMode === "timeline" && renderTimelineView()}
            </div>
          </div>
        </main>
      </div>

      <AddKnowledgeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          // Optionally show a success message
        }}
      />
    </div>
  );
}
