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
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle,
  DollarSign,
  Loader2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { CreateProjectDialog } from "./create-project-dialog";

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data: projects = [], isLoading, error } = trpc.projects.getAll.useQuery();

  // Calculate project metrics
  const metrics = useMemo((): FroxStatCardProps[] => {
    const activeProjects = projects.filter((p) => p.status === "active");
    const completedProjects = projects.filter((p) => p.status === "completed");
    const atRiskProjects = projects.filter(
      (p) => p.status === "on-hold" || p.status === "cancelled"
    );

    const totalProjects = projects.length;
    const completionRate =
      totalProjects > 0 ? Math.round((completedProjects.length / totalProjects) * 100) : 0;

    return [
      {
        value: activeProjects.length,
        label: "Active Projects",
        icon: Briefcase,
        iconBgColor: "blue",
        trend: activeProjects.length > 0 ? "up" : undefined,
        trendValue: activeProjects.length > 0 ? `+${activeProjects.length}` : undefined,
        dropdownActions: [
          {
            id: "view",
            label: "View All Active",
            onClick: () => setActiveFilter("active"),
          },
        ],
      },
      {
        value: `${completionRate}%`,
        label: "Completion Rate",
        icon: CheckCircle,
        iconBgColor: "green",
        trend: completionRate > 50 ? "up" : "down",
        trendValue: `${completedProjects.length}/${totalProjects}`,
      },
      {
        value: atRiskProjects.length,
        label: "At Risk",
        icon: AlertTriangle,
        iconBgColor: "orange",
        dropdownActions:
          atRiskProjects.length > 0
            ? [
                {
                  id: "review",
                  label: "Review At Risk",
                  onClick: () => setActiveFilter("at-risk"),
                },
              ]
            : undefined,
      },
      {
        value: "12",
        label: "Team Velocity",
        icon: TrendingUp,
        iconBgColor: "violet",
        trend: "up",
        trendValue: "tasks/week",
      },
    ];
  }, [projects]);

  // Quick filters
  const quickFilters: FilterOption[] = [
    {
      id: "all",
      label: "All",
      count: projects.length,
      active: activeFilter === "all",
    },
    {
      id: "active",
      label: "Active",
      count: projects.filter((p) => p.status === "active").length,
      active: activeFilter === "active",
    },
    {
      id: "planning",
      label: "Planning",
      count: projects.filter((p) => p.status === "planning").length,
      active: activeFilter === "planning",
    },
    {
      id: "completed",
      label: "Completed",
      count: projects.filter((p) => p.status === "completed").length,
      active: activeFilter === "completed",
    },
  ];

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "active":
        return "default";
      case "planning":
        return "secondary";
      case "on-hold":
        return "outline";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-accent/10 text-emerald-accent";
      case "planning":
        return "bg-blue-accent/10 text-blue-accent";
      case "on-hold":
        return "bg-orange-accent/10 text-orange-accent";
      case "completed":
        return "bg-green-accent/10 text-green-accent";
      case "cancelled":
        return "bg-red-accent/10 text-red-accent";
      default:
        return "bg-gray-200/10 text-gray-500";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimelineString = (timeline) => {
    if (!timeline || typeof timeline !== "object") return "No timeline set";
    const start = timeline.start || timeline.startDate;
    const end = timeline.end || timeline.endDate;
    if (!start || !end) return "Timeline incomplete";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Filter by status
    if (activeFilter !== "all") {
      if (activeFilter === "at-risk") {
        if (project.status !== "on-hold" && project.status !== "cancelled") return false;
      } else if (project.status !== activeFilter) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Render project card
  const renderProjectCard = (project, _index: number, mode: ViewMode) => {
    // Grid View Card
    if (mode === "grid") {
      return (
        <Card
          key={project.id}
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-indigo-accent dark:hover:border-indigo-accent"
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className={`rounded-lg p-2 ${getStatusBgColor(project.status || "planning")}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <Badge
                variant={getStatusColor(project.status || "planning")}
                className="text-xs capitalize"
              >
                {project.status || "planning"}
              </Badge>
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 group-hover:text-indigo-accent transition-colors line-clamp-1">
              {project.name}
            </CardTitle>
            <CardDescription className="text-desc text-gray-600 dark:text-gray-dark-600 line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-dark-600">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {project.budget ? `$${project.budget.toLocaleString()}` : "No budget"}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-dark-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {getTimelineString(project.timeline)}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-dark-600">
                  <Users className="mr-2 h-4 w-4" />
                  Team members
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-neutral-border">
                <Link href={`/projects/${project.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/insights`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    AI Insights
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // List View Card
    return (
      <Card
        key={project.id}
        className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-dark-neutral-border hover:border-indigo-accent dark:hover:border-indigo-accent"
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-2 ${getStatusBgColor(project.status || "planning")}`}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-header-7 font-semibold text-gray-1100 dark:text-gray-dark-1100">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-dark-600 mt-1 line-clamp-1">
                    {project.description || "No description provided"}
                  </p>
                </div>
                <Badge
                  variant={getStatusColor(project.status || "planning")}
                  className="text-xs ml-4 capitalize"
                >
                  {project.status || "planning"}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-dark-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {project.budget ? `$${project.budget.toLocaleString()}` : "No budget"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getTimelineString(project.timeline)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Team
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/insights`}>
                  <Button variant="outline" size="sm">
                    AI Insights
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load projects"
        description={error.message}
      />
    );
  }

  return (
    <>
      <PageContainer
        breadcrumbs={[
          { id: "dashboard", label: "Dashboard", href: "/dashboard" },
          { id: "projects", label: "Projects", href: "/projects" },
        ]}
        title="Projects"
        description="Manage your consulting projects and track progress"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)} size="default">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      >
        {/* Metrics Dashboard */}
        <MetricsGrid metrics={metrics} columns={4} />

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search projects..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          quickFilters={quickFilters}
          onQuickFilterClick={setActiveFilter}
          viewModes={["grid", "list"]}
          currentView={viewMode}
          onViewChange={setViewMode}
        />

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-accent" />
          </div>
        ) : (
          <ContentGrid
            items={filteredProjects}
            viewMode={viewMode}
            renderCard={(project, index) => renderProjectCard(project, index, viewMode)}
            gridColumns={3}
            emptyState={
              <EmptyState
                icon={Briefcase}
                title="No projects found"
                description={
                  searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first project to get started"
                }
                action={
                  !searchQuery ? (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        )}
      </PageContainer>

      <CreateProjectDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
}
