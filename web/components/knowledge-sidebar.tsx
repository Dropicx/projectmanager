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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
} from "@consulting-platform/ui";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  ChevronRight,
  Edit,
  FileText,
  Filter,
  Folder,
  GripVertical,
  Hash,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SortAsc,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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

interface SortableCategoryProps {
  category: any;
  level: number;
  isSelected: boolean;
  onCategorySelect: (id: string) => void;
  onEditCategory: (category: any, e: React.MouseEvent) => void;
  onDeleteCategory: (id: string, e: React.MouseEvent) => void;
  children?: React.ReactNode;
  hasChildren: boolean;
}

function SortableCategory({
  category,
  level,
  isSelected,
  onCategorySelect,
  onEditCategory,
  onDeleteCategory,
  children,
  hasChildren,
}: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderCategoryIcon = (iconName?: string | null, color?: string | null) => {
    const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : Folder;
    return <Icon className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: color || undefined }} />;
  };

  // For categories with children, we use Accordion
  if (hasChildren) {
    return (
      <div ref={setNodeRef} style={style}>
        <AccordionItem value={category.id} className="border-none">
          <div className="relative group">
            <div className="flex items-center">
              {/* Drag handle */}
              <div
                {...attributes}
                {...listeners}
                className="p-1 hover:bg-accent rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </div>

              <div className="flex-1 flex items-center">
                {/* Category button that can be clicked even with children */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 justify-start px-2 py-1.5 h-auto font-normal",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {renderCategoryIcon(category.icon, category.color)}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    {category.item_count > 0 && (
                      <span className="text-xs text-muted-foreground mr-2">
                        {category.item_count}
                      </span>
                    )}
                  </div>
                </Button>

                {/* Accordion trigger just for expand/collapse */}
                <AccordionTrigger className="px-2 py-1.5 hover:bg-transparent [&[data-state=open]>svg]:rotate-90" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e: React.MouseEvent) => onEditCategory(category, e)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e: React.MouseEvent) => onDeleteCategory(category.id, e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <AccordionContent className="pb-1">
            <div className="ml-6">{children}</div>
          </AccordionContent>
        </AccordionItem>
      </div>
    );
  }

  // For categories without children
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-center">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-accent rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 justify-start px-2 py-1.5 h-auto font-normal",
            isSelected && "bg-accent"
          )}
          onClick={() => onCategorySelect(category.id)}
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
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e: React.MouseEvent) => onEditCategory(category, e)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e: React.MouseEvent) => onDeleteCategory(category.id, e)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

type SortOption = "name-asc" | "name-desc" | "items-asc" | "items-desc" | "manual";

type FilterOption = {
  showEmpty: boolean;
  searchQuery: string;
};

export function KnowledgeSidebar({
  selectedCategory,
  onCategorySelect,
  onSearch,
}: KnowledgeSidebarProps) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("manual");
  const [filterOption, setFilterOption] = useState<FilterOption>({
    showEmpty: true,
    searchQuery: "",
  });
  const [draggedCategories, setDraggedCategories] = useState<any[] | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const utils = trpc.useUtils();

  // Fetch categories from API
  const { data: categories = [], isLoading } = trpc.knowledge.getCategories.useQuery();

  // Update position mutation
  const updatePositionMutation = trpc.knowledge.updateCategory.useMutation();

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

  // Apply sorting and filtering to categories
  const processedCategories = useMemo(() => {
    // Use dragged categories if we're currently dragging, otherwise use the fetched categories
    const baseCategories = draggedCategories || categories;
    let processed = [...baseCategories];

    // Apply filtering
    if (!filterOption.showEmpty) {
      processed = processed.filter((cat) => cat.item_count && cat.item_count > 0);
    }

    if (filterOption.searchQuery) {
      const query = filterOption.searchQuery.toLowerCase();
      processed = processed.filter((cat) => cat.name.toLowerCase().includes(query));
    }

    // Apply sorting
    switch (sortOption) {
      case "name-asc":
        processed.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        processed.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "items-asc":
        processed.sort((a, b) => (a.item_count || 0) - (b.item_count || 0));
        break;
      case "items-desc":
        processed.sort((a, b) => (b.item_count || 0) - (a.item_count || 0));
        break;
      default:
        // Keep original order (by position)
        processed.sort((a, b) => (a.position || 0) - (b.position || 0));
        break;
    }

    return processed;
  }, [categories, draggedCategories, sortOption, filterOption.showEmpty, filterOption.searchQuery]);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = processedCategories.findIndex((cat) => cat.id === active.id);
      const newIndex = processedCategories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(processedCategories, oldIndex, newIndex);
      setDraggedCategories(newCategories);

      // Update positions in the database only if in manual sort mode
      if (sortOption === "manual") {
        // Collect position updates
        const updates = newCategories
          .map((cat, index) => ({ id: cat.id, position: index }))
          .filter((update, idx) => newCategories[idx].position !== update.position);

        // Update positions without triggering immediate refetch
        for (const update of updates) {
          await updatePositionMutation.mutateAsync(update);
        }

        // Refetch categories after all updates are done
        utils.knowledge.getCategories.invalidate();
        // Clear dragged state after successful update
        setDraggedCategories(null);
      }
    }

    setActiveId(null);
  };

  // Build category tree structure
  const buildCategoryTree = () => {
    const rootCategories = processedCategories.filter((cat) => !cat.parent_id);
    const childMap = new Map<string, typeof processedCategories>();

    processedCategories.forEach((cat) => {
      if (cat.parent_id) {
        if (!childMap.has(cat.parent_id)) {
          childMap.set(cat.parent_id, []);
        }
        childMap.get(cat.parent_id)?.push(cat);
      }
    });

    return { rootCategories, childMap };
  };

  const { rootCategories, childMap } = buildCategoryTree();

  const renderCategory = (category: any, level = 0) => {
    const children = childMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isSelected = selectedCategory === category.id;

    return (
      <SortableCategory
        key={category.id}
        category={category}
        level={level}
        isSelected={isSelected}
        onCategorySelect={onCategorySelect || (() => {})}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        hasChildren={hasChildren}
      >
        {hasChildren && (
          <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {children.map((child: any) => renderCategory(child, level + 1))}
          </SortableContext>
        )}
      </SortableCategory>
    );
  };

  const activeCategory = processedCategories.find((cat) => cat.id === activeId);

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

            {/* Filter Button */}
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    (!filterOption.showEmpty || filterOption.searchQuery) && "text-primary"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Filter Categories</h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search categories..."
                        value={filterOption.searchQuery}
                        onChange={(e) =>
                          setFilterOption({
                            ...filterOption,
                            searchQuery: e.target.value,
                          })
                        }
                        className="h-8"
                      />
                      {filterOption.searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setFilterOption({
                              ...filterOption,
                              searchQuery: "",
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant={filterOption.showEmpty ? "outline" : "default"}
                        size="sm"
                        onClick={() =>
                          setFilterOption({
                            ...filterOption,
                            showEmpty: !filterOption.showEmpty,
                          })
                        }
                        className="w-full"
                      >
                        {filterOption.showEmpty ? "Hide" : "Show"} Empty Categories
                      </Button>
                    </div>
                  </div>

                  {(!filterOption.showEmpty || filterOption.searchQuery) && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFilterOption({
                            showEmpty: true,
                            searchQuery: "",
                          })
                        }
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", sortOption !== "manual" && "text-primary")}
                >
                  <SortAsc className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <DropdownMenuRadioItem value="manual">
                    <GripVertical className="h-4 w-4 mr-2" />
                    Manual Order
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc">
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Name (A to Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Name (Z to A)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="items-desc">
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Most Items
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="items-asc">
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Least Items
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : processedCategories.length === 0 ? (
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

              {/* Show message if filtering results in no categories */}
              {processedCategories.length === 0 && categories.length > 0 ? (
                <div className="text-center py-8 px-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No categories match your filters
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFilterOption({
                        showEmpty: true,
                        searchQuery: "",
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rootCategories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Accordion type="multiple" className="w-full">
                      {rootCategories.map((category) => renderCategory(category))}
                    </Accordion>
                  </SortableContext>

                  <DragOverlay>
                    {activeId && activeCategory ? (
                      <div className="bg-background border rounded-md shadow-lg p-2 opacity-90">
                        <div className="flex items-center">
                          <Folder
                            className="h-4 w-4 mr-2"
                            style={{ color: activeCategory.color || undefined }}
                          />
                          <span className="text-sm">{activeCategory.name}</span>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
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
