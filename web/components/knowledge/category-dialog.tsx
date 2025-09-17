"use client";

import {
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
import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  Folder,
  Hash,
  Loader2,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    parent_id?: string | null;
  };
  onSuccess?: () => void;
}

const iconOptions = [
  { value: "Folder", label: "Folder", Icon: Folder },
  { value: "FileText", label: "Document", Icon: FileText },
  { value: "BookOpen", label: "Book", Icon: BookOpen },
  { value: "Hash", label: "Tag", Icon: Hash },
  { value: "Calendar", label: "Calendar", Icon: Calendar },
  { value: "Users", label: "Team", Icon: Users },
  { value: "Settings", label: "Settings", Icon: Settings },
  { value: "ChevronRight", label: "Arrow", Icon: ChevronRight },
];

const colorOptions = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#6B7280", label: "Gray" },
  { value: "#EC4899", label: "Pink" },
  { value: "#14B8A6", label: "Teal" },
];

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [icon, setIcon] = useState(category?.icon || "Folder");
  const [color, setColor] = useState(category?.color || "#6B7280");
  const [parentId, setParentId] = useState<string | null>(category?.parent_id || null);

  const nameId = useId();
  const descriptionId = useId();
  const iconId = useId();
  const colorId = useId();
  const parentId_ = useId();

  const utils = trpc.useUtils();

  // Update form state when category prop changes
  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setIcon(category.icon || "Folder");
      setColor(category.color || "#6B7280");
      setParentId(category.parent_id || null);
    } else {
      setName("");
      setDescription("");
      setIcon("Folder");
      setColor("#6B7280");
      setParentId(null);
    }
  }, [category]);

  // Get categories for parent selection
  const { data: categories = [] } = trpc.knowledge.getCategories.useQuery();

  const createMutation = trpc.knowledge.createCategory.useMutation({
    onSuccess: () => {
      utils.knowledge.getCategories.invalidate();
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const updateMutation = trpc.knowledge.updateCategory.useMutation({
    onSuccess: () => {
      utils.knowledge.getCategories.invalidate();
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const resetForm = () => {
    if (!category) {
      setName("");
      setDescription("");
      setIcon("Folder");
      setColor("#6B7280");
      setParentId(null);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (category) {
      updateMutation.mutate({
        id: category.id,
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        parent_id: parentId || undefined,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        parent_id: parentId || undefined,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Get selected icon component
  const SelectedIcon = iconOptions.find((opt) => opt.value === icon)?.Icon || Folder;

  // Filter out current category and its children from parent options
  const availableParentCategories = categories.filter((cat) => {
    if (!category) return true;
    return cat.id !== category.id && cat.parent_id !== category.id;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details below."
              : "Create a new category to organize your knowledge base."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={nameId}>Name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Technical Documentation"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={descriptionId}>Description (optional)</Label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category..."
              className="h-20"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={iconId}>Icon</Label>
              <Select value={icon} onValueChange={setIcon} disabled={isSubmitting}>
                <SelectTrigger id={iconId}>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <SelectedIcon className="h-4 w-4" style={{ color }} />
                      <span>{iconOptions.find((opt) => opt.value === icon)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={colorId}>Color</Label>
              <Select value={color} onValueChange={setColor} disabled={isSubmitting}>
                <SelectTrigger id={colorId}>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
                      <span>{colorOptions.find((opt) => opt.value === color)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: option.value }}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableParentCategories.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor={parentId_}>Parent Category (optional)</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(value: string) => setParentId(value === "none" ? null : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id={parentId_}>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top-level)</SelectItem>
                  {availableParentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
