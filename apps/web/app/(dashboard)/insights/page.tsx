import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@consulting-platform/ui'
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  const insights = [
    {
      id: '1',
      title: 'Project Timeline Risk',
      type: 'risk',
      description: 'High risk identified in timeline dependencies for Digital Transformation project',
      confidence: 85,
      impact: 'high',
      recommendation: 'Consider adding buffer time for critical path activities',
      generatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Resource Optimization',
      type: 'optimization',
      description: 'Resource allocation can be improved by 15% through better task distribution',
      confidence: 92,
      impact: 'medium',
      recommendation: 'Reallocate 2 team members from low-priority to high-priority tasks',
      generatedAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      title: 'Budget Variance Alert',
      type: 'alert',
      description: 'Current spending is 8% above projected budget for Q1',
      confidence: 78,
      impact: 'high',
      recommendation: 'Review and adjust scope or increase budget allocation',
      generatedAt: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      title: 'Team Performance Insight',
      type: 'performance',
      description: 'Team velocity has increased by 12% over the past month',
      confidence: 88,
      impact: 'positive',
      recommendation: 'Maintain current practices and consider scaling successful patterns',
      generatedAt: '2024-01-14T16:20:00Z'
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return AlertTriangle
      case 'optimization': return TrendingUp
      case 'alert': return AlertTriangle
      case 'performance': return Lightbulb
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'risk': return 'destructive'
      case 'optimization': return 'success'
      case 'alert': return 'warning'
      case 'performance': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          AI-powered insights and recommendations for your projects
        </p>
      </div>

      <div className="grid gap-6">
        {insights.map((insight) => {
          const Icon = getInsightIcon(insight.type)
          return (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getInsightColor(insight.type)}>
                      {insight.type}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Recommendation</h4>
                    <p className="text-sm text-gray-600">{insight.recommendation}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Impact: {insight.impact}</span>
                    <span>Generated: {new Date(insight.generatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
