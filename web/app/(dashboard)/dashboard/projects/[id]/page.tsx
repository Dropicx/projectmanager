'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { trpc } from '@/app/providers/trpc-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@consulting-platform/ui'
import { ArrowLeft, Edit, Trash, Calendar, DollarSign, Users, AlertCircle, Loader2, Brain } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: project, isLoading, error } = trpc.projects.getById.useQuery({ id: projectId })
  const { data: tasks } = trpc.projects.getTasks.useQuery({ projectId })
  const utils = trpc.useUtils()

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      router.push('/dashboard/projects')
    }
  })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId })
    } catch (error) {
      console.error('Failed to delete project:', error)
      setIsDeleting(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">Project not found</p>
        <Link href="/dashboard/projects">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">{project.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(project.status || 'planning')} className="text-sm">
            {project.status || 'planning'}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {project.timeline && typeof project.timeline === 'object' ? (
                <>
                  <p>Start: {formatDate((project.timeline as any).start || (project.timeline as any).startDate)}</p>
                  <p>End: {formatDate((project.timeline as any).end || (project.timeline as any).endDate)}</p>
                </>
              ) : (
                'No timeline set'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis and recommendations for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href={`/dashboard/projects/${projectId}/insights`}>
              <Button>Generate Insights</Button>
            </Link>
            {project.ai_insights && (
              <div className="flex-1 p-4 bg-muted rounded-lg">
                <p className="text-sm">Last generated insights available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Manage tasks and track progress for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tasks yet</p>
              <Button variant="outline">Add Task</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}