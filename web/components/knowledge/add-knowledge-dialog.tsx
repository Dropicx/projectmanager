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
import { useId, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

interface AddKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddKnowledgeDialog({ open, onOpenChange, onSuccess }: AddKnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<
    "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist"
  >("guide");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const titleId = useId();
  const typeId = useId();
  const categoryId = useId();
  const contentId = useId();
  const tagsId = useId();

  const utils = trpc.useUtils();

  // Fetch categories for selection
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  const createMutation = trpc.knowledge.createGeneral.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("guide");
    setCategoryIds([]);
    setTags([]);
    setTagInput("");
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    createMutation.mutate({
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Knowledge Item</DialogTitle>
          <DialogDescription>
            Create a new knowledge base item to share insights, methodologies, or templates.
          </DialogDescription>
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
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
