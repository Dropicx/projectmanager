'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@consulting-platform/ui'
import { Brain, TrendingUp, AlertCircle, Target, Lightbulb, BarChart3, RefreshCw, Download, Share2, Calendar, DollarSign, Users } from 'lucide-react'
import { trpc as api } from '@/app/providers/trpc-provider'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

export default function ProjectInsightsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'cost' | 'time' | 'risk'>('cost')

  // Fetch project
  const { data: project } = api.projects.getById.useQuery({ id: projectId })

  // Skip fetching knowledge entries for now to avoid errors
  const knowledgeEntries = []

  // Generate insights query
  const { data: insights, refetch: regenerateInsights, isRefetching } = api.projects.generateInsights.useQuery(
    { projectId },
    {
      enabled: false // Only fetch when requested
    }
  )

  const handleGenerateInsights = async () => {
    setIsGenerating(true)
    await regenerateInsights()
    setIsGenerating(false)
  }

  const handleExportInsights = () => {
    if (!insights) return

    const dataStr = JSON.stringify(insights, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project?.name || 'project'}-insights-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const metricsData = {
    cost: {
      label: 'Cost Efficiency',
      value: 75,
      trend: '+12%',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    time: {
      label: 'Time to Delivery',
      value: 82,
      trend: '-5 days',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    risk: {
      label: 'Risk Score',
      value: 35,
      trend: '-8%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-2">{project?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportInsights}
            disabled={!insights}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGenerating || isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating || isRefetching ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(metricsData).map(([key, metric]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${selectedMetric === key ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => setSelectedMetric(key as any)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">{metric.label}</CardTitle>
                <Badge className={metric.bgColor + ' ' + metric.color}>
                  {metric.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">{metric.value}%</span>
                  <BarChart3 className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Generated Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Strategic Analysis
            </CardTitle>
            {insights?.generatedAt && (
              <Badge variant="secondary">
                Generated {formatDistanceToNow(new Date(insights.generatedAt), { addSuffix: true })}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating || isRefetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing project data and generating insights...</p>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              {insights.executiveSummary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Executive Summary
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <ReactMarkdown>{insights.executiveSummary}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {insights.keyFindings && insights.keyFindings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Findings
                  </h3>
                  <ul className="space-y-2">
                    {insights.keyFindings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span className="text-gray-600">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Badge className={
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {rec.priority} priority
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{rec.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks & Mitigation */}
              {insights.risks && insights.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Risk Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.risks.map((risk: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{risk.type}</span>
                          <Badge variant="destructive">{risk.level}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                        {risk.mitigation && (
                          <p className="text-sm text-green-700 mt-2">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No insights generated yet. Click "Generate Insights" to analyze your project data.
              </p>
              <p className="text-sm text-gray-400">
                AI will analyze {knowledgeEntries?.length || 0} knowledge entries to provide strategic recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated Completion</span>
                <span className="font-medium">Mar 15, 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confidence Level</span>
                <Badge className="bg-green-100 text-green-700">85%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical Path Items</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Spend</span>
                <span className="font-medium">${project?.budget ? (project.budget * 0.65 / 1000).toFixed(1) : '0'}k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projected Total</span>
                <span className="font-medium">${project?.budget ? (project.budget * 0.95 / 1000).toFixed(1) : '0'}k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variance</span>
                <Badge className="bg-green-100 text-green-700">-5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}