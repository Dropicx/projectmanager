"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@consulting-platform/ui";
import { Book, Brain, Edit, FileText, Hash, RefreshCw, Save, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc as api } from "@/app/providers/trpc-provider";
import { QuickNote } from "@/components/knowledge/quick-note";

export default function ProjectKnowledgePage() {
  const params = useParams();
  const projectId = params.id as string;
  const [isEditingWiki, setIsEditingWiki] = useState(false);
  const [wikiContent, setWikiContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingWiki, setIsGeneratingWiki] = useState(false);

  // Fetch project
  const { data: project } = api.projects.getById.useQuery({ id: projectId });

  // Fetch knowledge entries
  const { data: entries, refetch: refetchEntries } = api.knowledge.getByProject.useQuery({
    projectId: projectId,
    limit: 100,
  });

  // Create mutation
  const createKnowledge = api.knowledge.create.useMutation({
    onSuccess: () => {
      refetchEntries();
      setIsEditingWiki(false);
    },
  });

  // Generate wiki query - we'll use refetch to trigger it
  const {
    data: generatedWiki,
    refetch: generateWiki,
    isRefetching: isGeneratingWikiData,
  } = api.knowledge.generateWiki.useQuery(
    { projectId },
    {
      enabled: false, // Don't run automatically
    }
  );

  // Update wiki content when generated
  useEffect(() => {
    if (generatedWiki?.content) {
      setWikiContent(generatedWiki.content);
      setIsGeneratingWiki(false);
    }
  }, [generatedWiki]);

  // Search query
  const { data: searchResults } = api.knowledge.search.useQuery(
    {
      query: searchQuery,
      projectId: projectId,
      limit: 20,
    },
    {
      enabled: searchQuery.length > 2,
    }
  );

  useEffect(() => {
    // Find existing wiki entry
    const wikiEntry = entries?.find(
      (e: any) => e.metadata?.isWiki === true || e.title === "Project Wiki"
    );
    if (wikiEntry) {
      setWikiContent(wikiEntry.content);
    }
  }, [entries]);

  const handleGenerateWiki = async () => {
    setIsGeneratingWiki(true);
    generateWiki();
  };

  const handleSaveWiki = async () => {
    createKnowledge.mutate({
      projectId: projectId,
      title: "Project Wiki",
      content: wikiContent,
      type: "documentation",
      tags: ["wiki", "documentation"],
      metadata: {
        isWiki: true,
        lastEditedAt: new Date().toISOString(),
      },
    });
  };

  const entryTypeConfig: Record<string, { icon: any; color: string }> = {
    note: { icon: FileText, color: "bg-blue-100 text-blue-700" },
    meeting: { icon: "👥", color: "bg-purple-100 text-purple-700" },
    decision: { icon: "💡", color: "bg-yellow-100 text-yellow-700" },
    feedback: { icon: "💬", color: "bg-green-100 text-green-700" },
    documentation: { icon: Book, color: "bg-indigo-100 text-indigo-700" },
    task_update: { icon: "✅", color: "bg-orange-100 text-orange-700" },
  };

  const displayEntries = searchQuery.length > 2 ? searchResults : entries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">{project?.name}</p>
        </div>
        <QuickNote projectId={projectId} onNoteAdded={() => refetchEntries()} />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery.length > 0 && searchQuery.length <= 2 && (
          <p className="text-sm text-gray-500 mt-1">Type at least 3 characters to search</p>
        )}
        {searchResults && searchQuery.length > 2 && (
          <p className="text-sm text-gray-600 mt-1">
            Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Project Wiki Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-indigo-600" />
            <CardTitle>Project Wiki</CardTitle>
          </div>
          <div className="flex gap-2">
            {!isEditingWiki ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateWiki}
                  disabled={isGeneratingWiki || isGeneratingWikiData}
                >
                  {isGeneratingWiki || isGeneratingWikiData ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      AI Generate
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditingWiki(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleSaveWiki} disabled={createKnowledge.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {createKnowledge.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingWiki(false);
                    // Reset to original content
                    const wikiEntry = entries?.find(
                      (e: any) => e.metadata?.isWiki === true || e.title === "Project Wiki"
                    );
                    if (wikiEntry) {
                      setWikiContent(wikiEntry.content);
                    }
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingWiki ? (
            <Textarea
              value={wikiContent}
              onChange={(e) => setWikiContent(e.target.value)}
              placeholder="Write your project documentation here..."
              rows={10}
              className="font-mono"
            />
          ) : (
            <div className="prose max-w-none">
              {wikiContent ? (
                <div className="whitespace-pre-wrap">{wikiContent}</div>
              ) : (
                <p className="text-gray-500 italic">
                  No wiki content yet. Click "AI Generate" to create one automatically or "Edit" to
                  write your own.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Entries */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        {displayEntries && displayEntries.length > 0 ? (
          <div className="space-y-3">
            {displayEntries.map((entry: any) => {
              const config = entryTypeConfig[entry.type] || entryTypeConfig.note;
              const Icon = config.icon;

              return (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {typeof Icon === "string" ? (
                            <span className="text-xl">{Icon}</span>
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                          <h3 className="font-semibold">{entry.title}</h3>
                          <Badge className={config.color}>{entry.type.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {entry.content.substring(0, 200)}
                          {entry.content.length > 200 && "..."}
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {entry.tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                <Hash className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Book className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No knowledge entries yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Use the Quick Note button to add your first entry.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
