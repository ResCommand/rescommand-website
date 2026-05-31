"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Highlighter, CheckSquare,
} from "lucide-react";
import { useEffect, useCallback } from "react";

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "rte-link" } }),
  Placeholder.configure({ placeholder: "Write the SOP steps here..." }),
  Underline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

export default function RichTextEditor({ content, onChange, minHeight = 300 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions,
    content: content || "<p></p>",
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        style: `outline:none; min-height:${minHeight}px; padding:12px 16px; font-size:14px; line-height:1.7; color:#374151;`,
      },
    },
  });

  // Sync content from parent if it changes externally (e.g. editing a different SOP)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>");
    }
    // Only re-run when content prop changes identity, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const runCmd = useCallback((command: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (command) {
      case "h1": chain.toggleHeading({ level: 1 }).run(); break;
      case "h2": chain.toggleHeading({ level: 2 }).run(); break;
      case "h3": chain.toggleHeading({ level: 3 }).run(); break;
      case "bold": chain.toggleBold().run(); break;
      case "italic": chain.toggleItalic().run(); break;
      case "underline": chain.toggleUnderline().run(); break;
      case "strike": chain.toggleStrike().run(); break;
      case "code": chain.toggleCode().run(); break;
      case "bullet": chain.toggleBulletList().run(); break;
      case "ordered": chain.toggleOrderedList().run(); break;
      case "task": chain.toggleTaskList().run(); break;
      case "left": chain.setTextAlign("left").run(); break;
      case "center": chain.setTextAlign("center").run(); break;
      case "right": chain.setTextAlign("right").run(); break;
      case "highlight": chain.toggleHighlight().run(); break;
    }
  }, [editor]);

  const isActive = useCallback((command: string): boolean => {
    if (!editor) return false;
    switch (command) {
      case "h1": return editor.isActive("heading", { level: 1 });
      case "h2": return editor.isActive("heading", { level: 2 });
      case "h3": return editor.isActive("heading", { level: 3 });
      case "bold": return editor.isActive("bold");
      case "italic": return editor.isActive("italic");
      case "underline": return editor.isActive("underline");
      case "strike": return editor.isActive("strike");
      case "code": return editor.isActive("code");
      case "bullet": return editor.isActive("bulletList");
      case "ordered": return editor.isActive("orderedList");
      case "task": return editor.isActive("taskList");
      case "highlight": return editor.isActive("highlight");
      default: return false;
    }
  }, [editor]);

  return (
    <div className="rte-wrapper" style={{ border: `1px solid ${editor?.isFocused ? "#1A56DB" : "#D1D5DB"}`, borderRadius: 6, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: "6px 8px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
        <Tb icon={<Heading1 size={14} />} cmd="h1" runCmd={runCmd} isActive={isActive} title="Heading 1" />
        <Tb icon={<Heading2 size={14} />} cmd="h2" runCmd={runCmd} isActive={isActive} title="Heading 2" />
        <Tb icon={<Heading3 size={14} />} cmd="h3" runCmd={runCmd} isActive={isActive} title="Heading 3" />
        <Div />
        <Tb icon={<Bold size={14} />} cmd="bold" runCmd={runCmd} isActive={isActive} title="Bold (Ctrl+B)" />
        <Tb icon={<Italic size={14} />} cmd="italic" runCmd={runCmd} isActive={isActive} title="Italic (Ctrl+I)" />
        <Tb icon={<UnderlineIcon size={14} />} cmd="underline" runCmd={runCmd} isActive={isActive} title="Underline (Ctrl+U)" />
        <Tb icon={<Strikethrough size={14} />} cmd="strike" runCmd={runCmd} isActive={isActive} title="Strikethrough" />
        <Tb icon={<Code size={14} />} cmd="code" runCmd={runCmd} isActive={isActive} title="Code" />
        <Div />
        <Tb icon={<List size={14} />} cmd="bullet" runCmd={runCmd} isActive={isActive} title="Bullet List" />
        <Tb icon={<ListOrdered size={14} />} cmd="ordered" runCmd={runCmd} isActive={isActive} title="Numbered List" />
        <Tb icon={<CheckSquare size={14} />} cmd="task" runCmd={runCmd} isActive={isActive} title="Checklist" />
        <Div />
        <Tb icon={<AlignLeft size={14} />} cmd="left" runCmd={runCmd} isActive={isActive} title="Align Left" />
        <Tb icon={<AlignCenter size={14} />} cmd="center" runCmd={runCmd} isActive={isActive} title="Center" />
        <Tb icon={<AlignRight size={14} />} cmd="right" runCmd={runCmd} isActive={isActive} title="Align Right" />
        <Div />
        <Tb icon={<Highlighter size={14} />} cmd="highlight" runCmd={runCmd} isActive={isActive} title="Highlight" />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .rte-wrapper .ProseMirror h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0 0.3em; }
        .rte-wrapper .ProseMirror h2 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0 0.3em; }
        .rte-wrapper .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.3em; }
        .rte-wrapper .ProseMirror p { margin: 0.4em 0; }
        .rte-wrapper .ProseMirror ul, .rte-wrapper .ProseMirror ol { padding-left: 1.5em; margin: 0.4em 0; }
        .rte-wrapper .ProseMirror ul { list-style: disc; }
        .rte-wrapper .ProseMirror ol { list-style: decimal; }
        .rte-wrapper .ProseMirror li { margin: 0.2em 0; }
        .rte-wrapper .ProseMirror pre { background: #F3F4F6; border-radius: 6px; padding: 8px 12px; font-family: monospace; font-size: 13px; }
        .rte-wrapper .ProseMirror code { background: #F3F4F6; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 13px; }
        .rte-wrapper .ProseMirror blockquote { border-left: 3px solid #D1D5DB; padding-left: 12px; color: #6B7280; margin: 0.5em 0; }
        .rte-wrapper .ProseMirror a { color: #1A56DB; text-decoration: underline; }
        .rte-wrapper .ProseMirror mark { background: #FEF08A; padding: 0 2px; border-radius: 2px; }
        .rte-wrapper .ProseMirror hr { border: none; border-top: 2px solid #E5E7EB; margin: 1em 0; }
        .rte-wrapper .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .rte-wrapper .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 6px; }
        .rte-wrapper .ProseMirror ul[data-type="taskList"] li label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
        .rte-wrapper .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] { margin-top: 3px; accent-color: #1A56DB; }
        .rte-wrapper .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9CA3AF; pointer-events: none; height: 0; }
        .tiptap { outline: none; }
      `}</style>
    </div>
  );
}

function Tb({ icon, cmd, runCmd, isActive, title }: { icon: React.ReactNode; cmd: string; runCmd: (c: string) => void; isActive: (c: string) => boolean; title: string }) {
  const active = isActive(cmd);
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); runCmd(cmd); }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 4, border: "none",
        background: active ? "#DBEAFE" : "transparent", cursor: "pointer",
        color: active ? "#1A56DB" : "#374151",
      }}
    >
      {icon}
    </button>
  );
}

function Div() {
  return <div style={{ width: 1, height: 20, background: "#E5E7EB", margin: "4px 2px" }} />;
}