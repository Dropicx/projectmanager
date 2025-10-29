"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type FroxStatCardProps,
  MetricsGrid,
  PageContainer,
} from "@consulting-platform/ui";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

export default function AnalyticsPage() {
  // Mock data - replace with actual data from API
  const metrics = {
    totalProjects: 12,
    activeProjects: 7,
    completedProjects: 5,
    totalBudget: 1250000,
    utilizedBudget: 780000,
    teamMembers: 24,
    activeMembers: 18,
    averageProjectDuration: 45,
    taskCompletionRate: 78,
    overdueTasks: 8,
    upcomingDeadlines: 15,
    clientSatisfaction: 4.6,
  };

  const recentActivity = [
    { project: "Digital Transformation", change: "+12%", trend: "up" },
    { project: "Cloud Migration", change: "+8%", trend: "up" },
    { project: "Security Audit", change: "-3%", trend: "down" },
    { project: "AI Integration", change: "+21%", trend: "up" },
  ];

  // Calculate metrics for FroxStatCards
  const froxMetrics = useMemo((): FroxStatCardProps[] => {
    const budgetUtilization = Math.round((metrics.utilizedBudget / metrics.totalBudget) * 100);
    const teamUtilization = Math.round((metrics.activeMembers / metrics.teamMembers) * 100);

    return [
      {
        value: metrics.totalProjects,
        label: "Total Projects",
        icon: BarChart3,
        iconBgColor: "green",
        trend: "up",
        trendValue: `${metrics.activeProjects} active`,
        dropdownActions: [
          {
            id: "view",
            label: "View All Projects",
            onClick: () => console.log("View all projects"),
          },
        ],
      },
      {
        value: `${budgetUtilization}%`,
        label: "Budget Utilization",
        icon: DollarSign,
        iconBgColor: "green",
        trend: budgetUtilization > 70 ? "up" : "down",
        trendValue: `$${(metrics.utilizedBudget / 1000).toFixed(0)}k / $${(metrics.totalBudget / 1000).toFixed(0)}k`,
      },
      {
        value: `${teamUtilization}%`,
        label: "Team Utilization",
        icon: Users,
        iconBgColor: "blue",
        trend: teamUtilization > 70 ? "up" : "down",
        trendValue: `${metrics.activeMembers}/${metrics.teamMembers} members`,
      },
      {
        value: `${metrics.taskCompletionRate}%`,
        label: "Task Completion",
        icon: CheckCircle,
        iconBgColor: "violet",
        trend: metrics.taskCompletionRate > 75 ? "up" : "down",
        trendValue: `${metrics.overdueTasks} overdue`,
      },
    ];
  }, []);

  return (
    <PageContainer
      breadcrumbs={[
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        { id: "analytics", label: "Analytics", href: "/analytics" },
      ]}
      title="Analytics Dashboard"
      description="Track project performance and team metrics"
      actions={
        <Button size="default" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      }
    >
      {/* Metrics Dashboard */}
      <MetricsGrid metrics={froxMetrics} columns={4} />

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200 dark:border-dark-neutral-border">
          <CardHeader>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-accent/10 p-2">
                <TrendingUp className="h-5 w-5 text-emerald-accent" />
              </div>
              Project Performance Trends
            </CardTitle>
            <CardDescription className="text-desc text-gray-600 dark:text-gray-dark-600">
              Recent activity across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.project}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-dark-gray-100 hover:bg-gray-200 dark:hover:bg-dark-gray-200 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-dark-900">
                    {activity.project}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={activity.trend === "up" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {activity.change}
                    </Badge>
                    {activity.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-accent" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-accent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-dark-neutral-border">
          <CardHeader>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100 flex items-center gap-2">
              <div className="rounded-lg bg-blue-accent/10 p-2">
                <Activity className="h-5 w-5 text-blue-accent" />
              </div>
              Resource Allocation
            </CardTitle>
            <CardDescription className="text-desc text-gray-600 dark:text-gray-dark-600">
              Team distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-dark-700">Development</span>
                  <span className="font-medium text-gray-900 dark:text-gray-dark-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-accent h-2.5 rounded-full transition-all duration-300"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-dark-700">Design</span>
                  <span className="font-medium text-gray-900 dark:text-gray-dark-900">25%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-violet-accent h-2.5 rounded-full transition-all duration-300"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-dark-700">Strategy</span>
                  <span className="font-medium text-gray-900 dark:text-gray-dark-900">20%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-accent h-2.5 rounded-full transition-all duration-300"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-dark-700">Operations</span>
                  <span className="font-medium text-gray-900 dark:text-gray-dark-900">10%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-accent h-2.5 rounded-full transition-all duration-300"
                    style={{ width: "10%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-gray-200 dark:border-dark-neutral-border">
          <CardHeader>
            <div className="rounded-lg bg-indigo-accent/10 p-2 w-fit mb-3">
              <Clock className="h-5 w-5 text-indigo-accent" />
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100">
              Average Project Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-1100 dark:text-gray-dark-1100">
              {metrics.averageProjectDuration}
              <span className="text-xl text-gray-600 dark:text-gray-dark-600 ml-2">days</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-dark-500 mt-2">
              Across all active projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-dark-neutral-border">
          <CardHeader>
            <div className="rounded-lg bg-orange-accent/10 p-2 w-fit mb-3">
              <AlertCircle className="h-5 w-5 text-orange-accent" />
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100">
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-1100 dark:text-gray-dark-1100">
              {metrics.upcomingDeadlines}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-dark-500 mt-2">
              In the next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-dark-neutral-border">
          <CardHeader>
            <div className="rounded-lg bg-green-accent/10 p-2 w-fit mb-3">
              <Users className="h-5 w-5 text-green-accent" />
            </div>
            <CardTitle className="text-header-6 font-semibold text-gray-1100 dark:text-gray-dark-1100">
              Client Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <div className="text-4xl font-bold text-gray-1100 dark:text-gray-dark-1100">
                {metrics.clientSatisfaction}
              </div>
              <span className="text-xl text-gray-600 dark:text-gray-dark-600">/5.0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-dark-500 mt-2">
              Based on recent feedback
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
