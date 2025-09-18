"use client";

import { useUser } from "@clerk/nextjs";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@consulting-platform/ui";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  Database,
  FileText,
  Hash,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

export default function DashboardPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects } = trpc.projects.getAll.useQuery();

  // Calculate knowledge statistics
  const totalClients = projects?.length || 0;
  const activeProjects = projects?.filter((p: any) => p.status === "active").length || 0;

  // Mock knowledge stats (will be real when DB is set up)
  const knowledgeStats = {
    totalNotes: 142,
    weeklyGrowth: 23,
    topTags: ["architecture", "security", "cloud", "devops"],
    recentInsights: 8,
  };

  // Get recent projects (top 3)
  const recentProjects = projects?.slice(0, 3) || [];

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "Consultant"}! Capture and leverage insights from your
          engagements.
        </p>

        {/* Global Knowledge Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search across all your knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-2/3"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Knowledge Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
            <Database className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.totalNotes}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />+{knowledgeStats.weeklyGrowth} this
              week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-tekhelet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">{totalClients} total projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeStats.recentInsights}</div>
            <p className="text-xs text-muted-foreground">Generated this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Growth</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+16%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Capture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Capture
            </CardTitle>
            <CardDescription>Add knowledge from any project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Meeting Notes
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lightbulb className="mr-2 h-4 w-4" />
                Technical Solution
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Client Feedback
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Knowledge */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Knowledge
              </CardTitle>
              <Link href="/knowledge">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "AWS Architecture Review",
                  client: "TechCorp",
                  time: "2h ago",
                  type: "technical",
                },
                {
                  title: "Security Audit Findings",
                  client: "FinanceInc",
                  time: "5h ago",
                  type: "audit",
                },
                {
                  title: "DevOps Strategy Meeting",
                  client: "StartupXYZ",
                  time: "1d ago",
                  type: "meeting",
                },
              ].map((entry) => (
                <div key={entry.title} className="text-sm space-y-1">
                  <p className="font-medium line-clamp-1">{entry.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.client}</span>
                    <span>•</span>
                    <span>{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-600" />
              AI Assistant
            </CardTitle>
            <CardDescription>Get insights from your knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Weekly Summary
              </Button>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Synthesize learnings across clients</p>
                <p>• Identify patterns and trends</p>
                <p>• Get recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your current client projects</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                New Project
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/knowledge`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last entry: {formatTimeAgo(project.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      12 notes
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No active engagements</p>
              <Link href="/projects">
                <Button size="sm">Start your first engagement</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Tags Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Popular Topics
          </CardTitle>
          <CardDescription>Your most frequently referenced areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {knowledgeStats.topTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-3 py-1 hover:bg-indigo-100 cursor-pointer transition-colors"
              >
                #{tag}
              </Badge>
            ))}
            <Badge variant="outline" className="px-3 py-1">
              +15 more
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
