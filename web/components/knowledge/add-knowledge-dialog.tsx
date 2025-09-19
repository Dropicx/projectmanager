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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@consulting-platform/ui";
import { FileText, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useId, useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import { type KnowledgeTypeConfig, knowledgeTypes } from "@/lib/knowledge-types";
import { KnowledgeEditor } from "./knowledge-editor";
import { TypeTemplate } from "./type-template";

interface AddKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddKnowledgeDialog({ open, onOpenChange, onSuccess }: AddKnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<
    "note" | "methodology" | "framework" | "template" | "case-study" | "guide" | "checklist"
  >("note");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [structuredData, setStructuredData] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [templateType, setTemplateType] = useState<string>("decision-record");

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
      utils.knowledge.getCategories.invalidate(); // Refresh category counts
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("note");
    setTemplateType("decision-record");
    setCategoryIds([]);
    setTags([]);
    setTagInput("");
    setUseTemplate(false);
    setStructuredData({});
    setActiveTab("basic");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    // For template mode, generate content from structured data
    let finalContent = content;
    if (useTemplate && structuredData.freeformContent) {
      finalContent = structuredData.freeformContent;
    } else if (!content.trim()) {
      return; // Need content if not using template
    }

    // Determine the type based on mode
    let submitType: typeof type;
    if (useTemplate && templateType) {
      // In template mode, derive type from selected template
      submitType = getBackendTypeFromTemplate(templateType);
    } else {
      // In basic mode, use the selected type (map "note" to "guide" for backend)
      submitType = type === "note" ? "guide" : type;
    }

    createMutation.mutate({
      title: title.trim(),
      content: finalContent.trim(),
      type: submitType as
        | "methodology"
        | "framework"
        | "template"
        | "case-study"
        | "guide"
        | "checklist",
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

  // Basic Mode type options - simple types including Simple Note
  const typeOptions = [
    { value: "note", label: "Simple Note", description: "Quick notes and documentation" },
    { value: "methodology", label: "Methodology", description: "Methods and approaches" },
    { value: "framework", label: "Framework", description: "Structured frameworks" },
    { value: "template", label: "Template", description: "Reusable templates" },
    { value: "case-study", label: "Case Study", description: "Project experiences" },
    { value: "guide", label: "Guide", description: "Reference documentation" },
    { value: "checklist", label: "Checklist", description: "Action lists and checks" },
  ] as const;

  // Template Mode options - structured templates only (no Simple Note)
  const templateOptions = knowledgeTypes.map((kt) => ({
    value: kt.id,
    label: kt.name,
    description: kt.description,
    icon: kt.icon,
  }));

  // Map frontend type to backend type (not used anymore, kept for reference)
  const _getBackendType = (frontendType: typeof type): string => {
    const typeMap: Record<typeof type, string> = {
      note: "guide", // Simple Note maps to guide type in backend
      methodology: "methodology",
      framework: "framework",
      template: "template",
      "case-study": "case-study",
      guide: "guide",
      checklist: "checklist",
    };
    return typeMap[frontendType] || "guide";
  };

  // Get the type configuration for template mode
  // Get the type configuration for template mode
  const getTypeConfig = () => {
    return knowledgeTypes.find((kt) => kt.id === templateType);
  };

  // Map template type to backend type for Template Mode
  const getBackendTypeFromTemplate = (templateId: string): typeof type => {
    const templateMap: Record<string, typeof type> = {
      "decision-record": "checklist",
      "solution-design": "framework",
      "issue-analysis": "framework",
      "method-process": "methodology",
      "reusable-template": "template",
      "reference-guide": "guide",
      "case-study": "case-study",
      "action-plan": "checklist",
    };
    return templateMap[templateId] || "guide";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Knowledge Item</DialogTitle>
          <DialogDescription>
            Create a new knowledge base item to share insights, methodologies, or templates.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Mode
            </TabsTrigger>
            <TabsTrigger value="template" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Template Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4">
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
                    onChange={(e) => {
                      setType(e.target.value as typeof type);
                      setUseTemplate(false);
                    }}
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
                    onValueChange={(value: string) =>
                      setCategoryIds(value === "none" ? [] : [value])
                    }
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
                <KnowledgeEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your knowledge content..."
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
          </TabsContent>

          <TabsContent value="template" className="mt-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-title">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-select">Template Type</Label>
                  <Select
                    value={templateType}
                    onValueChange={(value) => {
                      setTemplateType(value);
                      setUseTemplate(true);
                      setStructuredData({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{option.icon}</span>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {getTypeConfig() ? (
                <TypeTemplate
                  typeConfig={getTypeConfig() as KnowledgeTypeConfig}
                  onChange={(data) => {
                    setStructuredData(data);
                    setUseTemplate(true);
                  }}
                  onContentGenerated={(generatedContent) => {
                    setContent(generatedContent);
                    setStructuredData({ ...structuredData, freeformContent: generatedContent });
                  }}
                  mode="create"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a type to see the template
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
            disabled={
              !title.trim() ||
              (!content.trim() && !structuredData.freeformContent) ||
              createMutation.isPending
            }
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
