'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@consulting-platform/ui'
import { Plus, Calendar, DollarSign, Users, Loader2, AlertCircle } from 'lucide-react'
import { trpc } from '@/app/providers/trpc-provider'
import Link from 'next/link'
import { CreateProjectDialog } from './create-project-dialog'

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: projects, isLoading, error } = trpc.projects.getAll.useQuery()

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

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString()
  }

  const getTimelineString = (timeline: any) => {
    if (!timeline || typeof timeline !== 'object') return 'No timeline set'
    const start = timeline.start || timeline.startDate
    const end = timeline.end || timeline.endDate
    if (!start || !end) return 'Timeline incomplete'
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">Failed to load projects</p>
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your consulting projects and track progress
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="text-5xl">📁</div>
            <h3 className="text-xl font-semibold">No projects yet</h3>
            <p className="text-muted-foreground">
              Create your first project to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                  <Badge variant={getStatusColor(project.status || 'planning')}>
                    {project.status || 'planning'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {project.budget ? `$${project.budget.toLocaleString()}` : 'No budget set'}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {getTimelineString(project.timeline)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  Team members
                </div>
                <div className="flex gap-2 pt-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}