"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Textarea,
} from "@consulting-platform/ui";
import { cn } from "@consulting-platform/ui/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/app/providers/trpc-provider";
import type { KnowledgeTypeConfig, TypeField, TypeSection } from "@/lib/knowledge-types";
import { KnowledgeEditor } from "./knowledge-editor";

interface TypeTemplateProps {
  typeConfig: KnowledgeTypeConfig;
  initialData?: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onContentGenerated?: (content: string) => void;
  mode?: "create" | "edit" | "view";
}

export function TypeTemplate({
  typeConfig,
  initialData = {},
  onChange,
  onContentGenerated,
  mode = "create",
}: TypeTemplateProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(typeConfig.sections.filter((s) => s.required).map((s) => s.id))
  );
  const [activeTab, setActiveTab] = useState("structured");
  const [isGenerating, setIsGenerating] = useState(false);

  const aiMutation = trpc.ai.processRequest.useMutation();

  const handleFieldChange = (sectionId: string, fieldKey: string, value: unknown) => {
    const newData = {
      ...formData,
      [sectionId]: {
        ...(typeof formData[sectionId] === "object" && formData[sectionId] !== null
          ? formData[sectionId]
          : {}),
        [fieldKey]: value,
      } as Record<string, unknown>,
    };
    setFormData(newData);
    onChange(newData);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const generateStructuredContent = () => {
    let content = `# ${formData.title || typeConfig.name}\n\n`;

    typeConfig.sections.forEach((section) => {
      const sectionData = (
        typeof formData[section.id] === "object" && formData[section.id] !== null
          ? formData[section.id]
          : {}
      ) as Record<string, unknown>;
      const hasContent = Object.values(sectionData).some((v) => v);

      if (hasContent) {
        content += `## ${section.title}\n\n`;

        section.fields.forEach((field) => {
          const fieldKey = field.id || field.key;
          if (!fieldKey) return;
          const value = sectionData[fieldKey];
          if (value) {
            if (field.type === "textarea") {
              content += `${value}\n\n`;
            } else if (field.type === "select" || field.type === "checklist") {
              content += `**${field.label}:** ${Array.isArray(value) ? value.join(", ") : value}\n\n`;
            } else {
              content += `**${field.label}:** ${value}\n\n`;
            }
          }
        });
      }
    });

    if (onContentGenerated) {
      onContentGenerated(content);
    }
    // Switch to freeform tab to show the generated content
    setActiveTab("freeform");
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      // First generate the basic template
      let basicContent = `# ${formData.title || typeConfig.name}\n\n`;
      const contextData: Record<string, any> = {};

      typeConfig.sections.forEach((section) => {
        const sectionData = (
          typeof formData[section.id] === "object" && formData[section.id] !== null
            ? formData[section.id]
            : {}
        ) as Record<string, unknown>;
        const hasContent = Object.values(sectionData).some((v) => v);

        if (hasContent) {
          basicContent += `## ${section.title}\n\n`;
          contextData[section.title] = {};

          section.fields.forEach((field) => {
            const fieldKey = field.id || field.key;
            if (!fieldKey) return;
            const value = sectionData[fieldKey];
            if (value) {
              contextData[section.title][field.label] = value;
              if (field.type === "textarea") {
                basicContent += `${value}\n\n`;
              } else if (field.type === "select" || field.type === "checklist") {
                basicContent += `**${field.label}:** ${Array.isArray(value) ? value.join(", ") : value}\n\n`;
              } else {
                basicContent += `**${field.label}:** ${value}\n\n`;
              }
            }
          });
        }
      });

      // Create a prompt for AI enhancement based on the type
      const prompt = `You are a professional knowledge management assistant helping to create a ${typeConfig.name}.

Given the following structured information, create a comprehensive, well-written knowledge article that expands on the provided details.

Type: ${typeConfig.name}
Description: ${typeConfig.description}

Structured Data Provided:
${JSON.stringify(contextData, null, 2)}

Please create an enhanced version that:
1. Expands on each section with more detail and context
2. Adds smooth transitions between sections
3. Includes relevant insights and best practices
4. Maintains a professional, informative tone
5. Organizes information logically
6. Adds helpful context and explanations
7. Ensures completeness while remaining concise

Format the output in Markdown with clear headings and sections. Start with the title as # heading.`;

      try {
        // Call the AI API
        const response = await aiMutation.mutateAsync({
          type: "technical_docs", // Use technical_docs for knowledge article generation
          prompt: prompt,
          context: basicContent,
          complexity: 7, // Medium-high complexity for comprehensive content
          urgency: "realtime",
          accuracyRequired: "standard",
        });

        const enhancedContent = response.content || basicContent;

        if (onContentGenerated) {
          onContentGenerated(enhancedContent);
        }
        // Switch to freeform tab to show the generated content
        setActiveTab("freeform");
      } catch (apiError) {
        console.error("AI API error:", apiError);
        // Fallback to basic content if AI fails
        const fallbackContent =
          basicContent +
          "\n\n---\n\n" +
          "*Note: AI enhancement is temporarily unavailable. The basic template has been generated from your input fields.*";

        if (onContentGenerated) {
          onContentGenerated(fallbackContent);
        }
        setActiveTab("freeform");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFieldIcon = (fieldId: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      context: Info,
      decision: Target,
      stakeholders: Users,
      timeline: Calendar,
      impact: TrendingUp,
      risks: AlertTriangle,
      references: BookOpen,
      action_items: Zap,
    };
    return iconMap[fieldId] || FileText;
  };

  const renderField = (section: TypeSection, field: TypeField) => {
    const fieldKey = field.id || field.key || "";
    if (!fieldKey) return null;
    const sectionData = (
      typeof formData[section.id] === "object" && formData[section.id] !== null
        ? formData[section.id]
        : {}
    ) as Record<string, unknown>;
    const value = sectionData[fieldKey] || "";
    const FieldIcon = getFieldIcon(fieldKey);

    switch (field.type) {
      case "text":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={typeof value === "string" || typeof value === "number" ? value : ""}
              onChange={(e) => handleFieldChange(section.id, fieldKey, e.target.value)}
              placeholder={field.placeholder}
              disabled={mode === "view"}
            />
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => handleFieldChange(section.id, fieldKey, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              disabled={mode === "view"}
              className="min-h-[100px]"
            />
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="date"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => handleFieldChange(section.id, fieldKey, e.target.value)}
              disabled={mode === "view"}
            />
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              value={typeof value === "number" ? value : typeof value === "string" ? value : ""}
              onChange={(e) => handleFieldChange(section.id, fieldKey, e.target.value)}
              placeholder={field.placeholder}
              disabled={mode === "view"}
            />
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={typeof value === "string" ? value : ""}
              onValueChange={(val) => handleFieldChange(section.id, fieldKey, val)}
              disabled={mode === "view"}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => {
                  const optionValue = typeof option === "string" ? option : option.value;
                  const optionLabel = typeof option === "string" ? option : option.label;
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      case "checklist":
        return (
          <div key={fieldKey} className="space-y-2">
            <Label className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-muted-foreground" />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
              {field.options?.map((option) => {
                const optionValue = typeof option === "string" ? option : option.value;
                const optionLabel = typeof option === "string" ? option : option.label;
                const isSelected = Array.isArray(value) && value.includes(optionValue);
                return (
                  <Badge
                    key={optionValue}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (mode === "view") return;
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = isSelected
                        ? currentValues.filter((v) => v !== optionValue)
                        : [...currentValues, optionValue];
                      handleFieldChange(section.id, fieldKey, newValues);
                    }}
                  >
                    {optionLabel}
                  </Badge>
                );
              })}
            </div>
            {(field.helpText || field.description) && (
              <p className="text-sm text-muted-foreground">{field.helpText || field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Simple Note is not available in Template Mode
  // All templates are structured

  return (
    <div className="space-y-6">
      {/* Type Header */}
      <Card className={cn("border-l-4", `border-l-${typeConfig.color}-500`)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{typeConfig.icon}</span>
                {typeConfig.name}
              </CardTitle>
              <CardDescription>{typeConfig.description}</CardDescription>
            </div>
            {typeConfig.aiFeatures && Object.keys(typeConfig.aiFeatures).length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Assisted
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structured">Structured Fields</TabsTrigger>
          <TabsTrigger value="freeform">Free-form Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="structured" className="space-y-4 mt-4">
          {/* Required Sections Info */}
          {mode === "create" && typeConfig.sections.some((s) => s.required) && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="flex items-center gap-2 pt-4">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Required sections are marked with an asterisk (*) and must be completed.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sections */}
          {typeConfig.sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <CardTitle className="text-lg">
                      {section.title}
                      {section.required && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                  </div>
                  {(() => {
                    const sectionData = formData[section.id];
                    if (
                      sectionData &&
                      typeof sectionData === "object" &&
                      Object.keys(sectionData as object).length > 0
                    ) {
                      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
                    }
                    return null;
                  })()}
                </div>
                {section.description && expandedSections.has(section.id) && (
                  <CardDescription className="mt-2">{section.description}</CardDescription>
                )}
              </CardHeader>
              {expandedSections.has(section.id) && (
                <CardContent className="space-y-4 pt-0">
                  {section.fields.map((field) => renderField(section, field))}
                </CardContent>
              )}
            </Card>
          ))}

          {/* Generate Content Buttons */}
          {mode !== "view" && (
            <div className="flex justify-end gap-2">
              <Button
                onClick={generateStructuredContent}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Basic Template
              </Button>
              <Button
                onClick={generateAIContent}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Enhanced
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="freeform" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Free-form Content</CardTitle>
              <CardDescription>
                Write your content freely or use the structured fields to generate a starting point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeEditor
                content={
                  typeof formData.freeformContent === "string" ? formData.freeformContent : ""
                }
                onChange={(content) => {
                  setFormData({ ...formData, freeformContent: content });
                  onChange({ ...formData, freeformContent: content });
                }}
                placeholder="Start writing your knowledge content..."
                editable={mode !== "view"}
                showToolbar={mode !== "view"}
                minHeight="min-h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Features Info */}
      {typeConfig.aiFeatures && Object.keys(typeConfig.aiFeatures).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Features Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {typeConfig.aiFeatures.generateSummary && (
                <Badge variant="outline">Auto-Summary</Badge>
              )}
              {typeConfig.aiFeatures.suggestRelated && (
                <Badge variant="outline">Related Suggestions</Badge>
              )}
              {typeConfig.aiFeatures.autoTag && <Badge variant="outline">Auto-Tagging</Badge>}
              {typeConfig.aiFeatures.customPrompts && (
                <Badge variant="outline">
                  {typeConfig.aiFeatures.customPrompts.length} AI Prompts
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
