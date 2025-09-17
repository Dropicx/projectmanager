"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ScrollArea,
  Separator,
} from "@consulting-platform/ui";
import {
  Calendar,
  FileText,
  Filter,
  Folder,
  Hash,
  Plus,
  Search,
  Settings,
  SortAsc,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  children?: Category[];
  itemCount?: number;
}

interface KnowledgeSidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  onSearch?: (query: string) => void;
  onAddCategory?: () => void;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Technical Documentation",
    slug: "technical-docs",
    icon: "FileText",
    color: "#3B82F6",
    itemCount: 24,
    children: [
      {
        id: "1-1",
        name: "Architecture",
        slug: "architecture",
        itemCount: 8,
      },
      {
        id: "1-2",
        name: "API References",
        slug: "api-references",
        itemCount: 12,
      },
      {
        id: "1-3",
        name: "Security",
        slug: "security",
        itemCount: 4,
      },
    ],
  },
  {
    id: "2",
    name: "Best Practices",
    slug: "best-practices",
    icon: "Hash",
    color: "#10B981",
    itemCount: 18,
    children: [
      {
        id: "2-1",
        name: "Code Reviews",
        slug: "code-reviews",
        itemCount: 6,
      },
      {
        id: "2-2",
        name: "Performance",
        slug: "performance",
        itemCount: 7,
      },
      {
        id: "2-3",
        name: "Testing",
        slug: "testing",
        itemCount: 5,
      },
    ],
  },
  {
    id: "3",
    name: "Client Resources",
    slug: "client-resources",
    icon: "Folder",
    color: "#8B5CF6",
    itemCount: 15,
  },
  {
    id: "4",
    name: "Meeting Notes",
    slug: "meeting-notes",
    icon: "Calendar",
    color: "#F59E0B",
    itemCount: 32,
  },
];

const iconMap: { [key: string]: React.ComponentType<any> } = {
  FileText,
  Hash,
  Folder,
  Calendar,
};

export function KnowledgeSidebar({
  categories = mockCategories,
  selectedCategory,
  onCategorySelect,
  onSearch,
  onAddCategory,
}: KnowledgeSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const renderCategoryIcon = (iconName?: string, color?: string) => {
    const Icon = iconName ? iconMap[iconName] : Folder;
    return <Icon className="h-4 w-4 mr-2" style={{ color }} />;
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;

    if (hasChildren) {
      return (
        <AccordionItem key={category.id} value={category.id} className="border-none">
          <AccordionTrigger
            className={`hover:bg-accent hover:text-accent-foreground px-2 py-1.5 rounded-md ${
              selectedCategory === category.id ? "bg-accent" : ""
            }`}
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
              {category.itemCount && (
                <span className="text-xs text-muted-foreground mr-2">{category.itemCount}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="ml-4">
              {category.children?.map((child) => renderCategory(child, level + 1))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Button
        key={category.id}
        variant="ghost"
        size="sm"
        className={`w-full justify-start px-2 py-1.5 h-auto font-normal ${
          selectedCategory === category.id ? "bg-accent" : ""
        }`}
        onClick={() => onCategorySelect?.(category.id)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {level === 0 && renderCategoryIcon(category.icon, category.color)}
            <span className="text-sm">{category.name}</span>
          </div>
          {category.itemCount && (
            <span className="text-xs text-muted-foreground">{category.itemCount}</span>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Knowledge Base</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start h-8 px-2"
            onClick={() => onAddCategory?.()}
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
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => renderCategory(category))}
        </Accordion>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {}}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search knowledge base..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Recent">
            <CommandItem>Architecture Overview</CommandItem>
            <CommandItem>API Authentication Guide</CommandItem>
            <CommandItem>Performance Best Practices</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Categories">
            {categories.map((category) => (
              <CommandItem key={category.id}>
                {renderCategoryIcon(category.icon, category.color)}
                {category.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
