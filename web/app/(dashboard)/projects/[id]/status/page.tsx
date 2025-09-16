'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@consulting-platform/ui'
import { RefreshCw, TrendingUp, AlertCircle, CheckCircle, Clock, Users, Calendar, Target, Activity, Brain } from 'lucide-react'
import { trpc as api } from '@/app/providers/trpc-provider'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

export default function ProjectStatusPage() {
  const params = useParams()
  const projectId = projectId as string
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch project details
  const { data: project } = api.projects.get.useQuery({ id: projectId })

  // Fetch knowledge entries
  const { data: recentEntries, refetch: refetchEntries } = api.knowledge.getByProject.useQuery({
    projectId: projectId,
    limit: 10
  })

  // Generate status query
  const { data: statusData, refetch: refetchStatus, isLoading } = api.knowledge.generateStatus.useQuery({
    projectId: projectId
  })

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await refetchStatus()
    setIsGenerating(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'active': return <Activity className="h-5 w-5 text-blue-600" />
      case 'on-hold': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'planning': return <Target className="h-5 w-5 text-purple-600" />
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!project) {
    return <div>Loading project...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Status</h1>
          <p className="text-gray-600 mt-2">{project.name}</p>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Regenerate Status
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${getStatusColor(project.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(project.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{project.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{recentEntries?.length || 0}</p>
            <p className="text-xs text-gray-500">Total entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {project.updated_at
                ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${project.budget ? (project.budget / 1000).toFixed(0) + 'k' : '0'}
            </p>
            <Progress value={65} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Generated Status Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI-Generated Status Summary
            </CardTitle>
            {statusData?.lastUpdated && (
              <Badge variant="secondary">
                Updated {formatDistanceToNow(new Date(statusData.lastUpdated), { addSuffix: true })}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing project data...</p>
              </div>
            </div>
          ) : statusData ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{statusData.summary}</ReactMarkdown>
              {statusData.entriesAnalyzed > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Based on analysis of {statusData.entriesAnalyzed} recent updates
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No status data available. Add some notes to generate insights.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries && recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry: any) => {
                const entryType = (entry.metadata as any)?.type || 'note'
                const typeConfig = {
                  note: { color: 'bg-blue-100 text-blue-700', icon: '📝' },
                  meeting: { color: 'bg-purple-100 text-purple-700', icon: '👥' },
                  decision: { color: 'bg-yellow-100 text-yellow-700', icon: '💡' },
                  feedback: { color: 'bg-green-100 text-green-700', icon: '💬' },
                  task_update: { color: 'bg-orange-100 text-orange-700', icon: '✅' }
                }[entryType] || { color: 'bg-gray-100 text-gray-700', icon: '📄' }

                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeConfig.color}`}>
                        <span className="text-lg">{typeConfig.icon}</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {entryType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No activity yet. Start adding notes to track progress.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}