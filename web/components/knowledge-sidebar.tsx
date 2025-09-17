"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Separator,
} from "@consulting-platform/ui";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Edit,
  FileText,
  Filter,
  Folder,
  Hash,
  Loader2,
  MoreHorizontal,
  Plus,
  Settings,
  SortAsc,
  Trash2,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { CategoryDialog } from "./knowledge/category-dialog";

interface KnowledgeSidebarProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string | undefined) => void;
  onSearch?: (query: string) => void;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  FileText,
  Hash,
  Folder,
  Calendar,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
};

export function KnowledgeSidebar({
  selectedCategory,
  onCategorySelect,
  onSearch,
}: KnowledgeSidebarProps) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const utils = trpc.useUtils();

  // Fetch categories from API
  const { data: categories = [], isLoading } = trpc.knowledge.getCategories.useQuery();

  // Delete mutation
  const deleteMutation = trpc.knowledge.deleteCategory.useMutation({
    onSuccess: () => {
      utils.knowledge.getCategories.invalidate();
      utils.knowledge.list.invalidate();
      if (selectedCategory === deleteMutation.variables?.id) {
        onCategorySelect?.(undefined);
      }
    },
  });

  const renderCategoryIcon = (iconName?: string | null, color?: string | null) => {
    const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : Folder;
    return <Icon className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: color || undefined }} />;
  };

  const handleEditCategory = (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate({ id: categoryId });
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  // Build category tree structure
  const buildCategoryTree = () => {
    const rootCategories = categories.filter((cat) => !cat.parent_id);
    const childMap = new Map<string, typeof categories>();

    categories.forEach((cat) => {
      if (cat.parent_id) {
        if (!childMap.has(cat.parent_id)) {
          childMap.set(cat.parent_id, []);
        }
        childMap.get(cat.parent_id)!.push(cat);
      }
    });

    return { rootCategories, childMap };
  };

  const { rootCategories, childMap } = buildCategoryTree();

  const renderCategory = (category: any, level = 0) => {
    const children = childMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isSelected = selectedCategory === category.id;

    if (hasChildren) {
      return (
        <AccordionItem key={category.id} value={category.id} className="border-none">
          <div className="relative group">
            <AccordionTrigger
              className={cn(
                "hover:bg-accent hover:text-accent-foreground px-2 py-1.5 rounded-md pr-8",
                isSelected && "bg-accent"
              )}
              onClick={(e) => {
                if (!hasChildren) {
                  e.preventDefault();
                  onCategorySelect?.(category.id);
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {renderCategoryIcon(category.icon, category.color)}
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                {category.item_count > 0 && (
                  <span className="text-xs text-muted-foreground mr-2">{category.item_count}</span>
                )}
              </div>
            </AccordionTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => handleEditCategory(category, e)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e: React.MouseEvent) => handleDeleteCategory(category.id, e)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <AccordionContent className="pb-1">
            <div className="ml-4">
              {children.map((child: any) => renderCategory(child, level + 1))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <div key={category.id} className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start px-2 py-1.5 h-auto font-normal pr-8",
            isSelected && "bg-accent"
          )}
          onClick={() => onCategorySelect?.(category.id)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {level === 0 && renderCategoryIcon(category.icon, category.color)}
              <span className="text-sm">{category.name}</span>
            </div>
            {category.item_count > 0 && (
              <span className="text-xs text-muted-foreground">{category.item_count}</span>
            )}
          </div>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-0.5 h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e: React.MouseEvent) => handleEditCategory(category, e)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e: React.MouseEvent) => handleDeleteCategory(category.id, e)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col bg-background border-r">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start h-8 px-2"
              onClick={handleAddCategory}
            >
              <Plus className="h-3 w-3 mr-1" />
              Category
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No categories yet</p>
              <Button size="sm" variant="outline" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant={!selectedCategory ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start px-2 py-1.5 h-auto font-normal mb-2"
                onClick={() => onCategorySelect?.(undefined)}
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="text-sm">All Knowledge</span>
              </Button>
              <Accordion type="multiple" className="w-full">
                {rootCategories.map((category) => renderCategory(category))}
              </Accordion>
            </>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {}}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={() => {
          utils.knowledge.getCategories.invalidate();
        }}
      />
    </>
  );
}
