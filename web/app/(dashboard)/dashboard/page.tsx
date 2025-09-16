'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@consulting-platform/ui'
import { trpc } from '@/app/providers/trpc-provider'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Briefcase, CheckCircle, AlertCircle, Brain } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useUser()
  const { data: projects } = trpc.projects.getAll.useQuery()

  // Calculate statistics
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter((p: any) => p.status === 'active').length || 0
  const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0
  const totalBudget = projects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0

  // Get recent projects (top 5)
  const recentProjects = projects?.slice(0, 5) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'planning': return 'warning'
      case 'on-hold': return 'secondary'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const then = new Date(date)
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.username || 'User'}! Here's your consulting platform overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your most recently updated projects
                </CardDescription>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
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
                    href={`/dashboard/projects/${project.id}`}
                    className="block hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatTimeAgo(project.updated_at)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(project.status || 'planning')} className="ml-2">
                        {project.status || 'planning'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Link href="/dashboard/projects">
                  <Button size="sm">Create your first project</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/projects" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
              <Link href="/dashboard/insights" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </Button>
              </Link>
              <Link href="/dashboard/knowledge" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Browse Knowledge Base
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {projects && projects.length > 0 && projects.some((p: any) => p.ai_insights) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>
              Latest AI-generated insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Risk Assessment</p>
                <p className="text-xs text-blue-700">
                  AI analysis available for {projects.filter((p: any) => p.risk_assessment).length} projects
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Optimization</p>
                <p className="text-xs text-green-700">
                  Cost optimization opportunities identified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}