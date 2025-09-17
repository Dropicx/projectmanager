"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@consulting-platform/ui";
import {
  AlertCircle,
  FileText,
  Lightbulb,
  ListTodo,
  MessageSquare,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { trpc as api } from "@/app/providers/trpc-provider";

interface QuickNoteProps {
  projectId: string;
  onNoteAdded?: () => void;
}

const noteTypes = [
  { value: "note", label: "Note", icon: FileText, color: "bg-blue-100 text-blue-700" },
  { value: "meeting", label: "Meeting", icon: Users, color: "bg-purple-100 text-purple-700" },
  { value: "decision", label: "Decision", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
  {
    value: "feedback",
    label: "Feedback",
    icon: MessageSquare,
    color: "bg-green-100 text-green-700",
  },
  {
    value: "task_update",
    label: "Task Update",
    icon: ListTodo,
    color: "bg-orange-100 text-orange-700",
  },
];

export function QuickNote({ projectId, onNoteAdded }: QuickNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("note");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createNoteMutation = api.knowledge.create.useMutation({
    onSuccess: () => {
      // Reset form
      setTitle("");
      setContent("");
      setType("note");
      setTags([]);
      setIsExpanded(false);

      // Callback
      if (onNoteAdded) {
        onNoteAdded();
      }
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    createNoteMutation.mutate({
      projectId,
      title,
      content,
      type: type as any,
      tags,
      metadata: {
        wordCount: content.split(" ").length,
        characterCount: content.length,
      },
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-2"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add Quick Note
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Add to Knowledge Base</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Note Type Selection */}
        <div className="flex gap-2 flex-wrap">
          {noteTypes.map((noteType) => (
            <button
              key={noteType.value}
              onClick={() => setType(noteType.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                type === noteType.value
                  ? noteType.color
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <noteType.icon className="h-3.5 w-3.5" />
              {noteType.label}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <div>
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            placeholder={
              type === "meeting"
                ? "e.g., Weekly Standup - Jan 15"
                : type === "decision"
                  ? "e.g., Chose React over Vue for frontend"
                  : type === "feedback"
                    ? "e.g., Client feedback on MVP demo"
                    : "e.g., Important note about..."
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content Input */}
        <div>
          <Label htmlFor="note-content">Content</Label>
          <Textarea
            id="note-content"
            placeholder={
              type === "meeting"
                ? "Meeting notes, attendees, action items..."
                : type === "decision"
                  ? "What was decided, why, and by whom..."
                  : type === "feedback"
                    ? "Feedback details, source, and implications..."
                    : "Your note content..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length} characters • {content.split(" ").filter((w) => w).length} words
          </p>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="note-tags">Tags (optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="note-tags"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            />
            <Button size="sm" variant="outline" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsExpanded(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createNoteMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {createNoteMutation.isPending ? "Saving..." : "Save to Knowledge Base"}
          </Button>
        </div>

        {createNoteMutation.isError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Failed to save note. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
