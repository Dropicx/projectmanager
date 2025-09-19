"use client";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@consulting-platform/ui";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { KnowledgeEditor } from "./knowledge-editor";

interface EditKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledge: any;
  onSuccess?: () => void;
}

export function EditKnowledgeDialog({
  open,
  onOpenChange,
  knowledge,
  onSuccess,
}: EditKnowledgeDialogProps) {
  const [title, setTitle] = useState(knowledge.title || "");
  const [content, setContent] = useState(knowledge.content || "");
  const [type, setType] = useState<
    "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist"
  >(mapToFrontendType(knowledge.knowledge_type));
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(knowledge.tags || []);
  const [tagInput, setTagInput] = useState("");

  const titleId = useId();
  const typeId = useId();
  const categoryId = useId();
  const contentId = useId();
  const tagsId = useId();

  const _utils = trpc.useUtils();

  // Fetch categories for selection
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  // Fetch current categories for this knowledge item
  const { data: knowledgeCategories } = trpc.knowledge.getKnowledgeCategories.useQuery(
    { knowledgeId: knowledge.id },
    { enabled: !!knowledge.id }
  );

  useEffect(() => {
    if (knowledgeCategories) {
      setCategoryIds(knowledgeCategories.map((c: any) => c.id));
    }
  }, [knowledgeCategories]);

  const updateMutation = trpc.knowledge.updateGeneral.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    updateMutation.mutate({
      id: knowledge.id,
      title: title.trim(),
      content: content.trim(),
      type,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  function mapToFrontendType(
    backendType: string
  ): "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist" {
    const typeMap: Record<
      string,
      "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist"
    > = {
      pattern: "methodology",
      template: "template",
      reference: "guide",
      solution: "framework",
      decision: "checklist",
      insight: "case-study",
      issue: "framework",
      lesson_learned: "case-study",
    };
    return typeMap[backendType] || "guide";
  }

  const typeOptions = [
    { value: "methodology", label: "Methodology" },
    { value: "framework", label: "Framework" },
    { value: "template", label: "Template" },
    { value: "case-study", label: "Case Study" },
    { value: "guide", label: "Guide" },
    { value: "checklist", label: "Checklist" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Item</DialogTitle>
          <DialogDescription>Update the information for this knowledge item.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={titleId}>Title</Label>
            <Input
              id={titleId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={typeId}>Type</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(
                    value as
                      | "methodology"
                      | "framework"
                      | "template"
                      | "case-study"
                      | "guide"
                      | "checklist"
                  )
                }
              >
                <SelectTrigger id={typeId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={categoryId}>Categories</Label>
              <Select
                value={categoryIds[0] || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setCategoryIds([]);
                  } else {
                    setCategoryIds([value]);
                  }
                }}
              >
                <SelectTrigger id={categoryId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={contentId}>Content</Label>
            <KnowledgeEditor
              content={content}
              onChange={setContent}
              placeholder="Update your knowledge content..."
              minHeight="min-h-[300px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={tagsId}>Tags</Label>
            <div className="flex gap-2">
              <Input
                id={tagsId}
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
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
