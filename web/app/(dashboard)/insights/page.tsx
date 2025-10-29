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
import { AlertTriangle, Brain, Lightbulb, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { useMemo, useState } from "react";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const insights = [
    {
      id: "1",
      title: "Project Timeline Risk",
      type: "risk",
      description:
        "High risk identified in timeline dependencies for Digital Transformation project",
      confidence: 85,
      impact: "high",
      recommendation: "Consider adding buffer time for critical path activities",
      generatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      title: "Resource Optimization",
      type: "optimization",
      description: "Resource allocation can be improved by 15% through better task distribution",
      confidence: 92,
      impact: "medium",
      recommendation: "Reallocate 2 team members from low-priority to high-priority tasks",
      generatedAt: "2024-01-15T09:15:00Z",
    },
    {
      id: "3",
      title: "Budget Variance Alert",
      type: "alert",
      description: "Current spending is 8% above projected budget for Q1",
      confidence: 78,
      impact: "high",
      recommendation: "Review and adjust scope or increase budget allocation",
      generatedAt: "2024-01-15T08:45:00Z",
    },
    {
      id: "4",
      title: "Team Performance Insight",
      type: "performance",
      description: "Team velocity has increased by 12% over the past month",
      confidence: 88,
      impact: "positive",
      recommendation: "Maintain current practices and consider scaling successful patterns",
      generatedAt: "2024-01-14T16:20:00Z",
    },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "risk":
        return AlertTriangle;
      case "optimization":
        return TrendingUp;
      case "alert":
        return AlertTriangle;
      case "performance":
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "risk":
        return "destructive";
      case "optimization":
        return "secondary";
      case "alert":
        return "outline";
      case "performance":
        return "default";
      default:
        return "default";
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "risk":
        return "bg-red-accent/10 text-red-accent";
      case "optimization":
        return "bg-green-accent/10 text-green-accent";
      case "alert":
        return "bg-orange-accent/10 text-orange-accent";
      case "performance":
        return "bg-violet-accent/10 text-violet-accent";
      default:
        return "bg-blue-accent/10 text-blue-accent";
    }
  };

  // Calculate metrics for FroxStatCards
  const metrics = useMemo((): FroxStatCardProps[] => {
    const totalInsights = insights.length;
    const highImpact = insights.filter((i) => i.impact === "high").length;
    const avgConfidence = Math.round(
      insights.reduce((sum: number, i: any) => sum + i.confidence, 0) / totalInsights
    );
    const risks = insights.filter((i) => i.type === "risk").length;

    return [
      {
        value: totalInsights,
        label: "Total Insights",
        icon: Brain,
        iconBgColor: "violet",
        trend: "up",
        trendValue: "+3 this week",
      },
      {
        value: `${avgConfidence}%`,
        label: "Avg Confidence",
        icon: Target,
        iconBgColor: "blue",
        trend: avgConfidence > 80 ? "up" : "down",
        trendValue: avgConfidence > 80 ? "High accuracy" : "Review needed",
      },
      {
        value: highImpact,
        label: "High Impact",
        icon: Zap,
        iconBgColor: "orange",
        dropdownActions:
          highImpact > 0
            ? [
                {
                  id: "view",
                  label: "View High Impact",
                  onClick: () => setActiveFilter("high-impact"),
                },
              ]
            : undefined,
      },
      {
        value: risks,
        label: "Active Risks",
        icon: AlertTriangle,
        iconBgColor: "red",
        trend: risks > 0 ? "down" : undefined,
        dropdownActions:
          risks > 0
            ? [
                {
                  id: "review",
                  label: "Review Risks",
                  onClick: () => setActiveFilter("risk"),
                },
              ]
            : undefined,
      },
    ];
  }, []);

  // Quick filters
  const quickFilters: FilterOption[] = [
    {
      id: "all",
      label: "All",
      count: insights.length,
      active: activeFilter === "all",
    },
    {
      id: "risk",
      label: "Risks",
      count: insights.filter((i) => i.type === "risk").length,
      active: activeFilter === "risk",
    },
    {
      id: "optimization",
      label: "Optimizations",
      count: insights.filter((i) => i.type === "optimization").length,
      active: activeFilter === "optimization",
    },
    {
      id: "high-impact",
      label: "High Impact",
      count: insights.filter((i) => i.impact === "high").length,
      active: activeFilter === "high-impact",
    },
  ];

  // Filter insights
  const filteredInsights = insights
    .filter((insight) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "high-impact") return insight.impact === "high";
      return insight.type === activeFilter;
    })
    .filter((insight) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.recommendation.toLowerCase().includes(query)
      );
    });

  // Render insight card
  const renderInsightCard = (insight: any, _index: number, mode: ViewMode) => {
    const Icon = getInsightIcon(insight.type);

    // Grid View Card
    if (mode === "grid") {
      return (
        <Card
          key={insight.id}
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-violet-accent dark:hover:border-violet-accent"
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className={`rounded-lg p-2 ${getInsightBgColor(insight.type)}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getInsightColor(insight.type)} className="text-xs">
                  {insight.type}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 group-hover:text-violet-accent transition-colors">
              {insight.title}
            </CardTitle>
            <CardDescription className="text-desc text-gray-600 dark:text-gray-dark-600 line-clamp-2">
              {insight.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-dark-gray-100">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-dark-700 mb-1 uppercase tracking-wide">
                  Recommendation
                </h4>
                <p className="text-sm text-gray-900 dark:text-gray-dark-900">
                  {insight.recommendation}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-dark-500">
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
                <span className="flex items-center gap-1">
                  <span
                    className={`font-medium ${insight.impact === "high" ? "text-red-accent" : insight.impact === "medium" ? "text-orange-accent" : "text-green-accent"}`}
                  >
                    {insight.impact}
                  </span>
                  impact
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // List View Card
    return (
      <Card
        key={insight.id}
        className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-violet-accent dark:hover:border-violet-accent"
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-2 mt-1 ${getInsightBgColor(insight.type)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-header-7 font-semibold text-gray-1100 dark:text-gray-dark-1100">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-dark-600 mt-1">
                    {insight.description}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-dark-700 mt-2">
                    <span className="font-medium">Recommendation:</span> {insight.recommendation}
                  </p>
                </div>
                <Badge variant={getInsightColor(insight.type)} className="text-xs ml-4">
                  {insight.type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-dark-500">
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
                <span
                  className={`font-medium ${insight.impact === "high" ? "text-red-accent" : insight.impact === "medium" ? "text-orange-accent" : "text-green-accent"}`}
                >
                  {insight.impact} impact
                </span>
                <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
              </div>
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
        { id: "insights", label: "AI Insights", href: "/insights" },
      ]}
      title="AI Insights"
      description="AI-powered insights and recommendations for your projects"
      actions={
        <Button size="default" variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Insights
        </Button>
      }
    >
      {/* Metrics Dashboard */}
      <MetricsGrid metrics={metrics} columns={4} />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search insights..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilters={quickFilters}
        onQuickFilterClick={setActiveFilter}
        viewModes={["grid", "list"]}
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {/* Content Grid */}
      <ContentGrid
        items={filteredInsights}
        viewMode={viewMode}
        renderCard={(insight, index) => renderInsightCard(insight, index, viewMode)}
        gridColumns={2}
        emptyState={
          <EmptyState
            icon={Brain}
            title="No insights found"
            description={
              searchQuery
                ? "Try adjusting your search or filters"
                : "AI insights will appear here as they are generated"
            }
          />
        }
      />
    </PageContainer>
  );
}
