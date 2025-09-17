"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from "@consulting-platform/ui";
import { cn } from "@consulting-platform/ui/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Hash,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { KnowledgeEditor, KnowledgeViewer } from "./knowledge-editor";

interface KnowledgeDetailViewProps {
  knowledgeId: string;
  onBack: () => void;
  onDelete?: () => void;
}

export function KnowledgeDetailView({ knowledgeId, onBack, onDelete }: KnowledgeDetailViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedType, setEditedType] = useState<string>("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editedCategoryId, setEditedCategoryId] = useState<string | undefined>();

  const utils = trpc.useUtils();

  // Fetch knowledge item details
  const { data: item, isLoading } = trpc.knowledge.getById.useQuery(
    { id: knowledgeId },
    {
      enabled: !!knowledgeId,
    }
  );

  // Set initial values when item loads
  React.useEffect(() => {
    if (item) {
      setEditedTitle(item.title || "");
      setEditedContent(item.content || "");
      setEditedType(item.knowledge_type || "reference");
      setEditedTags(item.tags || []);
    }
  }, [item]);

  // Fetch categories
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  // Fetch current categories for this knowledge item
  const { data: knowledgeCategories } = trpc.knowledge.getKnowledgeCategories.useQuery(
    { knowledgeId },
    {
      enabled: !!knowledgeId && isEditMode,
    }
  );

  // Set category when data loads
  React.useEffect(() => {
    if (knowledgeCategories && knowledgeCategories.length > 0) {
      setEditedCategoryId(knowledgeCategories[0].id);
    }
  }, [knowledgeCategories]);

  // Update mutation
  const updateMutation = trpc.knowledge.updateGeneral.useMutation({
    onSuccess: () => {
      utils.knowledge.getById.invalidate({ id: knowledgeId });
      utils.knowledge.list.invalidate();
      utils.knowledge.getCategories.invalidate();
      setIsEditMode(false);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.knowledge.deleteGeneral.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      utils.knowledge.getCategories.invalidate(); // Refresh category counts
      onDelete?.();
      onBack();
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this knowledge item?")) {
      deleteMutation.mutate({ id: knowledgeId });
    }
  };

  const handleSave = () => {
    if (!editedTitle.trim() || !editedContent.trim()) return;

    const frontendType = mapBackendTypeToFrontend(editedType) as
      | "methodology"
      | "framework"
      | "template"
      | "case-study"
      | "guide"
      | "checklist";

    updateMutation.mutate({
      id: knowledgeId,
      title: editedTitle.trim(),
      content: editedContent.trim(),
      type: frontendType,
      categoryIds: editedCategoryId ? [editedCategoryId] : undefined,
      tags: editedTags.length > 0 ? editedTags : undefined,
    });
  };

  const handleCancel = () => {
    // Reset to original values
    if (item) {
      setEditedTitle(item.title || "");
      setEditedContent(item.content || "");
      setEditedType(item.knowledge_type || "reference");
      setEditedTags(item.tags || []);
    }
    setIsEditMode(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !editedTags.includes(tagInput.trim())) {
      setEditedTags([...editedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setEditedTags(editedTags.filter((t) => t !== tag));
  };

  const mapBackendTypeToFrontend = (
    backendType: string
  ): "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist" => {
    const typeMap: Record<
      string,
      "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist"
    > = {
      solution: "framework",
      issue: "framework",
      decision: "checklist",
      pattern: "methodology",
      template: "template",
      reference: "guide",
      insight: "case-study",
      lesson_learned: "case-study",
    };
    return typeMap[backendType] || "guide";
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
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto p-6">
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
                    {item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "Unknown"}
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
              {!isEditMode ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
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

        {/* Edit Mode Fields */}
        {isEditMode && (
          <div className="space-y-6 mb-6">
            {/* Title */}
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter title"
                className="text-lg font-semibold"
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={editedType} onValueChange={setEditedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solution">Solution</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="insight">Insight</SelectItem>
                    <SelectItem value="lesson_learned">Lesson Learned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={editedCategoryId || "none"}
                  onValueChange={(value) =>
                    setEditedCategoryId(value === "none" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {editedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div>
          {isEditMode ? (
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Content</Label>
              <KnowledgeEditor
                content={editedContent}
                onChange={setEditedContent}
                placeholder="Write your knowledge content..."
                minHeight="min-h-[600px]"
                className="max-w-none"
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Content</h2>
              </CardHeader>
              <CardContent>
                <KnowledgeViewer content={item.content} className="max-w-none" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metadata */}
        {item.updated_at && item.updated_at !== item.created_at && (
          <div className="mt-4 text-sm text-muted-foreground">
            Last updated {format(new Date(item.updated_at), "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}
