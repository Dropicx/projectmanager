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
  Textarea,
} from "@consulting-platform/ui";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

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
  >(mapFromKnowledgeType(knowledge.knowledge_type));
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(knowledge.tags || []);
  const [tagInput, setTagInput] = useState("");

  const titleId = useId();
  const typeId = useId();
  const categoryId = useId();
  const contentId = useId();
  const tagsId = useId();

  const utils = trpc.useUtils();

  // Fetch categories for selection
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  // Fetch current categories for this knowledge item
  const { data: knowledgeCategories } = trpc.knowledge.getKnowledgeCategories.useQuery(
    { knowledgeId: knowledge.id },
    { enabled: open }
  );

  useEffect(() => {
    if (knowledgeCategories) {
      setCategoryIds(knowledgeCategories.map((cat: any) => cat.id));
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
      tags,
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

  const typeOptions = [
    { value: "methodology", label: "Methodology" },
    { value: "framework", label: "Framework" },
    { value: "template", label: "Template" },
    { value: "case-study", label: "Case Study" },
    { value: "guide", label: "Guide" },
    { value: "checklist", label: "Checklist" },
  ] as const;

  function mapFromKnowledgeType(
    knowledgeType: string
  ): "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist" {
    const mapping: Record<string, any> = {
      solution: "guide",
      issue: "case-study",
      decision: "guide",
      pattern: "framework",
      template: "template",
      reference: "guide",
      insight: "case-study",
      lesson_learned: "case-study",
    };
    return mapping[knowledgeType] || "guide";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Item</DialogTitle>
          <DialogDescription>Update the knowledge base item details below.</DialogDescription>
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
              <select
                id={typeId}
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={categoryId}>Category (optional)</Label>
              <Select
                value={categoryIds[0] || "none"}
                onValueChange={(value: string) => setCategoryIds(value === "none" ? [] : [value])}
              >
                <SelectTrigger id={categoryId}>
                  <SelectValue placeholder="Select a category" />
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

          <div className="grid gap-2">
            <Label htmlFor={contentId}>Content</Label>
            <Textarea
              id={contentId}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the knowledge content..."
              className="min-h-[200px]"
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
