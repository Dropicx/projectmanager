"use client";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@consulting-platform/ui";
import { cn } from "@consulting-platform/ui/lib/utils";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { KnowledgeTypeConfig } from "@/lib/knowledge-types";

interface TypeViewerProps {
  typeConfig: KnowledgeTypeConfig;
  structuredData?: Record<string, any>;
  content: string;
  metadata?: {
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    tags?: string[];
  };
}

export function TypeViewer({ typeConfig, structuredData, content, metadata }: TypeViewerProps) {
  const getFieldIcon = (fieldId: string) => {
    const iconMap: Record<string, any> = {
      context: Info,
      decision: Target,
      stakeholders: Users,
      timeline: Calendar,
      impact: TrendingUp,
      risks: AlertTriangle,
      references: BookOpen,
      action_items: Zap,
      status: CheckCircle2,
      priority: AlertCircle,
      deadline: Clock,
      lessons: Lightbulb,
    };
    return iconMap[fieldId] || FileText;
  };

  const renderFieldValue = (value: any, fieldType: string) => {
    if (!value) return null;

    switch (fieldType) {
      case "multi-select":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item: string, index: number) => (
              <Badge key={index} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        ) : null;

      case "select":
        return <Badge variant="outline">{value}</Badge>;

      case "rich-text":
        return (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );

      case "textarea":
        return <p className="whitespace-pre-wrap text-sm">{value}</p>;

      default:
        return <span className="text-sm">{value}</span>;
    }
  };

  // If no structured data, just display the content
  if (!structuredData || Object.keys(structuredData).length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeConfig.icon}</span>
                <CardTitle>{typeConfig.name}</CardTitle>
              </div>
              {metadata?.tags && metadata.tags.length > 0 && (
                <div className="flex gap-1">
                  {metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <CardDescription>{typeConfig.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>

        {metadata && (metadata.created_at || metadata.created_by) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                {metadata.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {format(new Date(metadata.created_at), "PPP")}</span>
                  </div>
                )}
                {metadata.updated_at && metadata.updated_at !== metadata.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {format(new Date(metadata.updated_at), "PPP")}</span>
                  </div>
                )}
                {metadata.created_by && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Created by: {metadata.created_by}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render structured view
  return (
    <div className="space-y-4">
      {/* Type Header Card */}
      <Card className={cn("border-l-4", `border-l-${typeConfig.color}-500`)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeConfig.icon}</span>
              <div>
                <CardTitle>{typeConfig.name}</CardTitle>
                <CardDescription>{typeConfig.description}</CardDescription>
              </div>
            </div>
            {typeConfig.aiFeatures &&
              Object.keys(typeConfig.aiFeatures).some((k) => (typeConfig.aiFeatures as any)[k]) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  AI-Enhanced
                </Badge>
              )}
          </div>
        </CardHeader>
      </Card>

      {/* Structured Sections */}
      {typeConfig.sections.map((section) => {
        const sectionData = structuredData[section.id];
        const hasData = sectionData && Object.values(sectionData).some((v) => v);

        if (!hasData && !section.required) {
          return null; // Skip empty non-required sections
        }

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {section.title}
                  {section.required && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Required
                    </Badge>
                  )}
                </CardTitle>
                {hasData && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              {section.description && <CardDescription>{section.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="space-y-4">
                  {section.fields.map((field) => {
                    const fieldId = (field as any).id || (field as any).key;
                    const value = sectionData[fieldId];
                    if (!value) return null;

                    const FieldIcon = getFieldIcon(fieldId);

                    return (
                      <div key={fieldId} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FieldIcon className="h-4 w-4 text-muted-foreground" />
                          {field.label}
                        </div>
                        <div className="pl-6">{renderFieldValue(value, field.type)}</div>
                        {((field as any).helpText || (field as any).description) && (
                          <p className="pl-6 text-xs text-muted-foreground">
                            {(field as any).helpText || (field as any).description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No data provided for this section
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Free-form Content Section */}
      {structuredData.freeformContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: structuredData.freeformContent }}
            />
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {metadata && (metadata.created_at || metadata.created_by || metadata.tags) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metadata.tags && metadata.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Separator />
              <div className="space-y-2 text-sm text-muted-foreground">
                {metadata.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {format(new Date(metadata.created_at), "PPP")}</span>
                  </div>
                )}
                {metadata.updated_at && metadata.updated_at !== metadata.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {format(new Date(metadata.updated_at), "PPP")}</span>
                  </div>
                )}
                {metadata.created_by && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Created by: {metadata.created_by}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Features Available */}
      {typeConfig.aiFeatures &&
        Object.keys(typeConfig.aiFeatures).some((k) => (typeConfig.aiFeatures as any)[k]) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {typeConfig.aiFeatures.generateSummary && (
                  <Badge variant="outline" className="justify-center">
                    Auto-Summary
                  </Badge>
                )}
                {typeConfig.aiFeatures.suggestRelated && (
                  <Badge variant="outline" className="justify-center">
                    Related Items
                  </Badge>
                )}
                {typeConfig.aiFeatures.autoTag && (
                  <Badge variant="outline" className="justify-center">
                    Auto-Tagging
                  </Badge>
                )}
                {typeConfig.aiFeatures.customPrompts &&
                  typeConfig.aiFeatures.customPrompts.length > 0 && (
                    <Badge variant="outline" className="justify-center">
                      {typeConfig.aiFeatures.customPrompts.length} Custom Prompts
                    </Badge>
                  )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
