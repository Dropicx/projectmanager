"use client";

import { Button, cn, Separator } from "@consulting-platform/ui";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Table,
  Undo,
  Unlink,
} from "lucide-react";
import { useCallback } from "react";

interface EditorToolbarProps {
  editor: Editor;
  className?: string;
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className={cn("flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap", className)}>
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text formatting */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
          variant={editor.isActive("highlight") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          variant={editor.isActive("code") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Inline code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Links */}
      <div className="flex items-center gap-1">
        {editor.isActive("link") ? (
          <Button
            onClick={() => editor.chain().focus().unsetLink().run()}
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            title="Remove link"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={addLink}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Add link (Ctrl+K)"
          >
            <Link2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          variant={editor.isActive("taskList") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Task list"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Blocks */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          title="Code block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Table */}
      <div className="flex items-center gap-1">
        <Button
          onClick={insertTable}
          disabled={editor.isActive("table")}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Insert table"
        >
          <Table className="h-4 w-4" />
        </Button>
        {editor.isActive("table") && (
          <>
            <Button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              title="Add column"
            >
              + Col
            </Button>
            <Button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              title="Add row"
            >
              + Row
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              title="Delete column"
            >
              - Col
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteRow().run()}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              title="Delete row"
            >
              - Row
            </Button>
            <Button
              onClick={() => editor.chain().focus().deleteTable().run()}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-destructive"
              title="Delete table"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
