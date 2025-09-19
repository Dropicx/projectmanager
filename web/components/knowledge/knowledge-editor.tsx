"use client";

import { cn } from "@consulting-platform/ui/lib/utils";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./editor-toolbar";

interface KnowledgeEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
  minHeight?: string;
}

export function KnowledgeEditor({
  content,
  onChange,
  placeholder = "Start writing your knowledge...",
  className,
  editable = true,
  showToolbar = true,
  minHeight = "min-h-[200px]",
}: KnowledgeEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        dropcursor: {
          color: "#DBEAFE",
          width: 2,
        },
        heading: {
          levels: [1, 2, 3],
        },
        code: {
          HTMLAttributes: {
            class: "bg-muted px-1 py-0.5 rounded font-mono text-sm",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted p-3 rounded-md font-mono text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-primary pl-4 italic my-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6 my-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6 my-2",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "border-t my-4",
          },
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-900 px-1 rounded",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:opacity-80",
        },
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-muted-foreground before:pointer-events-none",
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-border",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border bg-muted px-3 py-2 text-left font-medium",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border px-3 py-2",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "my-2",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Typography,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none focus:outline-none",
          // Force heading styles - use !important to override any prose defaults
          "[&_h1]:!text-4xl [&_h1]:!font-bold [&_h1]:!mb-4 [&_h1]:!mt-6 [&_h1]:!leading-tight",
          "[&_h2]:!text-3xl [&_h2]:!font-semibold [&_h2]:!mb-3 [&_h2]:!mt-5 [&_h2]:!leading-tight",
          "[&_h3]:!text-2xl [&_h3]:!font-medium [&_h3]:!mb-2 [&_h3]:!mt-4 [&_h3]:!leading-tight",
          // Text spacing
          "prose-p:my-3 prose-p:leading-7",
          // Lists
          "prose-ul:my-3 prose-ol:my-3",
          "prose-li:my-1",
          // Code blocks
          "prose-code:before:content-none prose-code:after:content-none",
          // Tables
          "prose-table:my-4",
          "prose-th:font-semibold",
          // Links
          "prose-a:font-medium",
          // Strong emphasis
          "prose-strong:font-bold",
          minHeight,
          "p-4",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {showToolbar && editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// Export a read-only viewer component
export function KnowledgeViewer({ content, className }: { content: string; className?: string }) {
  return (
    <KnowledgeEditor
      content={content}
      onChange={() => {}}
      editable={false}
      showToolbar={false}
      className={className}
      minHeight=""
    />
  );
}
