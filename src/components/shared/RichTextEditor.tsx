// components/shared/RichTextEditor.tsx
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  toolbarOptions?: {
    options?: string[];
    bulletList?: {
      icon?: React.ReactNode;
      title?: string;
    };
    orderedList?: {
      icon?: React.ReactNode;
      title?: string;
    };
  };
  onValidate?: (content: string) => string | null;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "200px",
  toolbarOptions,
  onValidate,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-5",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-5",
        },
      }),
      Bold.configure({
        HTMLAttributes: {
          class: "font-bold",
        },
      }),
      Italic.configure({
        HTMLAttributes: {
          class: "italic",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Validate if callback provided
      if (onValidate) {
        const error = onValidate(html);
        // You can handle the error here (e.g., show validation message)
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[100px] p-3",
        placeholder: placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  // Default toolbar options
  const defaultOptions = [
    "bold",
    "italic",
    "bulletList",
    "orderedList",
    "link",
  ];
  const options = toolbarOptions?.options || defaultOptions;

  return (
    <div className="border text-black dark:text-white border-slate-300 dark:border-slate-600 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center text-black dark:text-white gap-1 p-2 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
        {options.includes("bold") && (
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive("bold") ? "bg-slate-300 dark:bg-slate-600" : ""}`}
            title="Bold"
          >
            <BoldIcon size={16} />
          </button>
        )}

        {options.includes("italic") && (
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive("italic") ? "bg-slate-300 dark:bg-slate-600" : ""}`}
            title="Italic"
          >
            <ItalicIcon size={16} />
          </button>
        )}

        {options.includes("bulletList") && (
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive("bulletList") ? "bg-slate-300 dark:bg-slate-600" : ""}`}
            title={toolbarOptions?.bulletList?.title || "Bullet List"}
          >
            {toolbarOptions?.bulletList?.icon || <List size={16} />}
          </button>
        )}

        {options.includes("orderedList") && (
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive("orderedList") ? "bg-slate-300 dark:bg-slate-600" : ""}`}
            title={toolbarOptions?.orderedList?.title || "Numbered List"}
          >
            {toolbarOptions?.orderedList?.icon || <ListOrdered size={16} />}
          </button>
        )}

        {options.includes("link") && (
          <button
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive("link") ? "bg-slate-300 dark:bg-slate-600" : ""}`}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </button>
        )}
      </div>

      {/* Editor content */}
      <div style={{ height, overflowY: "auto" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
