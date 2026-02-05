import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bold') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Bold"
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('italic') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Italic"
        >
          <span className="italic text-sm">I</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('strike') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Strikethrough"
        >
          <span className="line-through text-sm">S</span>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Heading"
        >
          <span className="font-bold text-sm">H</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bulletList') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Bullet List"
        >
          <span className="material-icons-outlined text-base">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('orderedList') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Numbered List"
        >
          <span className="material-icons-outlined text-base">format_list_numbered</span>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('blockquote') ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Quote"
        >
          <span className="material-icons-outlined text-base">format_quote</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="Horizontal Line"
        >
          <span className="material-icons-outlined text-base">horizontal_rule</span>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
