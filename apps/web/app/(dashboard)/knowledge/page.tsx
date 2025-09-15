import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@consulting-platform/ui'
import { Search, Plus, BookOpen, FileText, Users, Calendar } from 'lucide-react'

export default function KnowledgePage() {
  const knowledgeItems = [
    {
      id: '1',
      title: 'Digital Transformation Best Practices',
      content: 'Comprehensive guide to digital transformation methodologies...',
      type: 'methodology',
      tags: ['digital-transformation', 'methodology', 'best-practices'],
      author: 'John Smith',
      createdAt: '2024-01-10',
      views: 45,
      isPublic: true
    },
    {
      id: '2',
      title: 'Client Engagement Framework',
      content: 'Framework for effective client engagement and relationship management...',
      type: 'framework',
      tags: ['client-engagement', 'framework', 'relationships'],
      author: 'Sarah Johnson',
      createdAt: '2024-01-08',
      views: 32,
      isPublic: false
    },
    {
      id: '3',
      title: 'Project Risk Assessment Template',
      content: 'Template and guidelines for conducting project risk assessments...',
      type: 'template',
      tags: ['risk-assessment', 'template', 'project-management'],
      author: 'Mike Chen',
      createdAt: '2024-01-05',
      views: 28,
      isPublic: true
    },
    {
      id: '4',
      title: 'AI Implementation Case Study',
      content: 'Case study of successful AI implementation in enterprise environment...',
      type: 'case-study',
      tags: ['ai', 'implementation', 'case-study', 'enterprise'],
      author: 'Emily Davis',
      createdAt: '2024-01-03',
      views: 67,
      isPublic: true
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'methodology': return BookOpen
      case 'framework': return FileText
      case 'template': return FileText
      case 'case-study': return BookOpen
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'methodology': return 'success'
      case 'framework': return 'info'
      case 'template': return 'warning'
      case 'case-study': return 'default'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Centralized repository of consulting knowledge and best practices
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Knowledge
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Knowledge Items */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeItems.map((item) => {
          const Icon = getTypeIcon(item.type)
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {item.content}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {item.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.createdAt}
                      </span>
                    </div>
                    <span>{item.views} views</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      AI Search
                    </Button>
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
