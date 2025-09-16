'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Textarea } from '@consulting-platform/ui'
import { Book, Edit, Save, X, RefreshCw, Search, Plus, Brain, FileText, Hash } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { QuickNote } from '@/components/knowledge/quick-note'
import ReactMarkdown from 'react-markdown'

export default function ProjectKnowledgePage({ params }: { params: { id: string } }) {
  const [isEditingWiki, setIsEditingWiki] = useState(false)
  const [wikiContent, setWikiContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeneratingWiki, setIsGeneratingWiki] = useState(false)

  // Fetch project
  const { data: project } = api.projects.get.useQuery({ id: params.id })

  // Fetch knowledge entries
  const { data: entries, refetch: refetchEntries } = api.knowledge.getByProject.useQuery({
    projectId: params.id,
    limit: 100
  })

  // Generate wiki
  const { data: wikiData, refetch: refetchWiki } = api.knowledge.generateWiki.useQuery({
    projectId: params.id
  })

  // Search knowledge base
  const { data: searchResults } = api.knowledge.search.useQuery(
    {
      query: searchQuery,
      projectId: params.id,
      limit: 10
    },
    { enabled: searchQuery.length > 2 }
  )

  useEffect(() => {
    if (wikiData?.content) {
      setWikiContent(wikiData.content)
    }
  }, [wikiData])

  const handleGenerateWiki = async () => {
    setIsGeneratingWiki(true)
    await refetchWiki()
    setIsGeneratingWiki(false)
  }

  const handleSaveWiki = async () => {
    // Create or update a documentation entry
    await api.knowledge.create.mutate({
      projectId: params.id,
      title: 'Project Wiki',
      content: wikiContent,
      type: 'documentation',
      tags: ['wiki', 'documentation'],
      metadata: {
        isWiki: true,
        lastEditedAt: new Date().toISOString()
      }
    })
    setIsEditingWiki(false)
  }

  const entryTypeConfig = {
    note: { icon: FileText, color: 'bg-blue-100 text-blue-700' },
    meeting: { icon: '👥', color: 'bg-purple-100 text-purple-700' },
    decision: { icon: '💡', color: 'bg-yellow-100 text-yellow-700' },
    feedback: { icon: '💬', color: 'bg-green-100 text-green-700' },
    documentation: { icon: Book, color: 'bg-indigo-100 text-indigo-700' },
    task_update: { icon: '✅', color: 'bg-orange-100 text-orange-700' }
  }

  const displayEntries = searchQuery.length > 2 ? searchResults : entries

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">{project?.name}</p>
        </div>
      </div>

      {/* Quick Note Input */}
      <QuickNote
        projectId={params.id}
        onNoteAdded={() => refetchEntries()}
      />

      {/* Search Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {searchQuery.length > 2 && searchResults && (
            <p className="text-sm text-gray-600 mt-2">
              Found {searchResults.length} results
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wiki/Documentation Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-indigo-600" />
                  Project Wiki
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditingWiki ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateWiki}
                        disabled={isGeneratingWiki}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isGeneratingWiki ? 'animate-spin' : ''}`} />
                        Generate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingWiki(true)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingWiki(false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveWiki}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingWiki ? (
                <Textarea
                  value={wikiContent}
                  onChange={(e) => setWikiContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="# Project Overview

## Introduction
Add your project documentation here...

## Key Concepts

## Architecture

## Resources"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  {wikiContent ? (
                    <ReactMarkdown>{wikiContent}</ReactMarkdown>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No wiki content yet.</p>
                      <p className="text-sm mt-2">
                        Click "Generate" to create one from existing knowledge or "Edit" to write manually.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Entries List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5 text-gray-600" />
                Knowledge Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayEntries && displayEntries.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {displayEntries.map((entry: any) => {
                    const entryType = (entry.metadata as any)?.type || 'note'
                    const config = entryTypeConfig[entryType as keyof typeof entryTypeConfig]

                    return (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                              {entry.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {entry.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${config?.color || 'bg-gray-100'}`}
                              >
                                {typeof config?.icon === 'string' ? (
                                  <span className="mr-1">{config.icon}</span>
                                ) : config?.icon ? (
                                  <config.icon className="h-3 w-3 mr-1" />
                                ) : null}
                                {entryType}
                              </Badge>
                              {entry.similarity && (
                                <Badge variant="outline" className="text-xs">
                                  {(entry.similarity * 100).toFixed(0)}% match
                                </Badge>
                              )}
                            </div>
                            {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {entry.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No knowledge entries yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}