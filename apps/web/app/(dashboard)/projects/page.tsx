import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@consulting-platform/ui'
import { Plus, Calendar, DollarSign, Users } from 'lucide-react'

export default function ProjectsPage() {
  const projects = [
    {
      id: '1',
      name: 'Digital Transformation Initiative',
      description: 'Comprehensive digital transformation for enterprise client',
      status: 'active',
      budget: 250000,
      timeline: { start: '2024-01-15', end: '2024-06-30' },
      members: 8
    },
    {
      id: '2',
      name: 'Process Optimization',
      description: 'Streamline operational processes and reduce costs',
      status: 'planning',
      budget: 150000,
      timeline: { start: '2024-02-01', end: '2024-04-30' },
      members: 5
    },
    {
      id: '3',
      name: 'AI Implementation',
      description: 'Implement AI solutions for customer service',
      status: 'on-hold',
      budget: 300000,
      timeline: { start: '2024-03-01', end: '2024-08-31' },
      members: 12
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'planning': return 'warning'
      case 'on-hold': return 'info'
      case 'completed': return 'default'
      default: return 'default'
    }
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <Badge variant={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-2 h-4 w-4" />
                ${project.budget.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {project.timeline.start} - {project.timeline.end}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {project.members} members
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  AI Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
