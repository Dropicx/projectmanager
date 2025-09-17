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
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { KnowledgeSidebar } from "@/components/knowledge-sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

export const dynamic = "force-dynamic";

export default function KnowledgePage() {
  const { isCollapsed } = useSidebar();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const knowledgeItems = [
    {
      id: "1",
      title: "Digital Transformation Best Practices",
      content:
        "Comprehensive guide to digital transformation methodologies including step-by-step processes, key performance indicators, and change management strategies for successful implementation.",
      type: "methodology",
      tags: ["digital-transformation", "methodology", "best-practices"],
      author: "John Smith",
      createdAt: "2024-01-10",
      views: 45,
      isPublic: true,
      categoryId: "1-1",
    },
    {
      id: "2",
      title: "Client Engagement Framework",
      content:
        "Framework for effective client engagement and relationship management including communication protocols, stakeholder mapping, and engagement metrics.",
      type: "framework",
      tags: ["client-engagement", "framework", "relationships"],
      author: "Sarah Johnson",
      createdAt: "2024-01-08",
      views: 32,
      isPublic: false,
      categoryId: "2",
    },
    {
      id: "3",
      title: "Project Risk Assessment Template",
      content:
        "Template and guidelines for conducting project risk assessments with probability matrices, mitigation strategies, and contingency planning.",
      type: "template",
      tags: ["risk-assessment", "template", "project-management"],
      author: "Mike Chen",
      createdAt: "2024-01-05",
      views: 28,
      isPublic: true,
      categoryId: "1-3",
    },
    {
      id: "4",
      title: "AI Implementation Case Study",
      content:
        "Case study of successful AI implementation in enterprise environment featuring challenges faced, solutions deployed, and ROI achieved.",
      type: "case-study",
      tags: ["ai", "implementation", "case-study", "enterprise"],
      author: "Emily Davis",
      createdAt: "2024-01-03",
      views: 67,
      isPublic: true,
      categoryId: "1-2",
    },
    {
      id: "5",
      title: "Performance Optimization Guide",
      content:
        "Detailed guide on optimizing application performance including profiling techniques, caching strategies, and database optimization.",
      type: "guide",
      tags: ["performance", "optimization", "best-practices"],
      author: "Alex Turner",
      createdAt: "2024-01-12",
      views: 89,
      isPublic: true,
      categoryId: "2-2",
    },
    {
      id: "6",
      title: "Security Compliance Checklist",
      content:
        "Comprehensive checklist for security compliance covering GDPR, SOC 2, ISO 27001, and other industry standards.",
      type: "checklist",
      tags: ["security", "compliance", "checklist"],
      author: "Rachel Green",
      createdAt: "2024-01-15",
      views: 112,
      isPublic: true,
      categoryId: "1-3",
    },
  ];

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      methodology: BookOpen,
      framework: FileText,
      template: FileText,
      "case-study": BookOpen,
      guide: BookOpen,
      checklist: FileText,
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: string): any => {
    const colors: { [key: string]: any } = {
      methodology: "default",
      framework: "secondary",
      template: "outline",
      "case-study": "default",
      guide: "default",
      checklist: "secondary",
    };
    return colors[type] || "default";
  };

  const filteredItems = knowledgeItems.filter((item) => {
    if (selectedCategory && item.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const renderGridView = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredItems.map((item) => {
        const Icon = getTypeIcon(item.type);
        return (
          <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Icon className="h-5 w-5 text-primary" />
                <Badge variant={getTypeColor(item.type)} className="text-xs">
                  {item.type}
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3">{item.content}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {item.author}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.views}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {item.createdAt}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredItems.map((item) => {
        const Icon = getTypeIcon(item.type);
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
                    <Badge variant={getTypeColor(item.type)} className="text-xs ml-4">
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {item.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.createdAt}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.views} views
                    </span>
                    <div className="flex gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTimelineView = () => {
    const groupedByDate = filteredItems.reduce(
      (acc, item) => {
        const date = item.createdAt;
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, typeof filteredItems>
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
              {items.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <Badge variant={getTypeColor(item.type)} className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{item.author}</span>
                            <span>•</span>
                            <span>{item.views} views</span>
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
                    {filteredItems.length} items {selectedCategory && "in category"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button>
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

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
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
    </div>
  );
}
