"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Separator,
  Skeleton,
} from "@consulting-platform/ui";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Edit, Hash, Trash2, User } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { EditKnowledgeDialog } from "./edit-knowledge-dialog";

interface KnowledgeDetailViewProps {
  knowledgeId: string;
  onBack: () => void;
  onDelete?: () => void;
}

export function KnowledgeDetailView({ knowledgeId, onBack, onDelete }: KnowledgeDetailViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  // Fetch knowledge item details
  const { data: item, isLoading } = trpc.knowledge.getById.useQuery(
    { id: knowledgeId },
    { enabled: !!knowledgeId }
  );

  // Delete mutation
  const deleteMutation = trpc.knowledge.deleteGeneral.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      onDelete?.();
      onBack();
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this knowledge item?")) {
      deleteMutation.mutate({ id: knowledgeId });
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      solution: "Solution",
      issue: "Issue",
      decision: "Decision",
      pattern: "Pattern",
      template: "Template",
      reference: "Reference",
      insight: "Insight",
      lesson_learned: "Lesson Learned",
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      solution: "bg-green-100 text-green-800",
      issue: "bg-red-100 text-red-800",
      decision: "bg-blue-100 text-blue-800",
      pattern: "bg-purple-100 text-purple-800",
      template: "bg-yellow-100 text-yellow-800",
      reference: "bg-gray-100 text-gray-800",
      insight: "bg-indigo-100 text-indigo-800",
      lesson_learned: "bg-orange-100 text-orange-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Knowledge item not found</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-bold">{item.title}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Created{" "}
                      {item.created_at
                        ? format(new Date(item.created_at), "MMM d, yyyy")
                        : "Unknown"}
                    </span>
                  </div>
                  {item.created_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>by {item.created_by}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Type and Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.knowledge_type && (
                <Badge className={getTypeColor(item.knowledge_type)}>
                  {getTypeLabel(item.knowledge_type)}
                </Badge>
              )}
              {item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  {(item.tags as string[]).map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </>
              ) : null}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Content */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Content</h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{item.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {item.updated_at && item.updated_at !== item.created_at && (
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated {format(new Date(item.updated_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditKnowledgeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          knowledge={item}
          onSuccess={() => {
            utils.knowledge.getById.invalidate({ id: knowledgeId });
            utils.knowledge.list.invalidate();
          }}
        />
      )}
    </>
  );
}
