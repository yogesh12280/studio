'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { useCallback, useRef } from 'react';
import { Bold, Italic, Strikethrough, Code, Image as ImageIcon, Pilcrow, Minus, Table as TableIcon, Trash2, Quote, Heading1, Heading2, Heading3, List, ListOrdered, WrapText, Columns, Rows } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Separator } from './separator';

const TipTapToolbar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex flex-wrap items-center gap-1">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

       <Button
        onClick={() => editor.chain().focus().setParagraph().run()}
        variant={editor.isActive('paragraph') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Paragraph"
      >
        <Pilcrow className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
       <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
       <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
       <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
       <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>
       <Button
        onClick={() => editor.chain().focus().setHardBreak().run()}
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Hard Break"
      >
        <WrapText className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        onClick={addImage}
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8"
        title="Add Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button
            onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Insert Table"
        >
            <TableIcon className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Add Column Before"
        >
            <Columns className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8 rotate-180'
            title="Add Column After"
        >
            <Columns className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Delete Column"
        >
            <Minus className='h-4 w-4' />
            <Columns className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Add Row Before"
        >
            <Rows className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8 rotate-180'
            title="Add Row After"
        >
            <Rows className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Delete Row"
        >
            <Minus className='h-4 w-4' />
            <Rows className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Delete Table"
        >
            <Trash2 className='h-4 w-4' />
            <TableIcon className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
            title="Toggle Header Row"
        >
            <Heading1 className='h-4 w-4' />
        </Button>
    </div>
  );
};


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, 
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, 
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn('prose dark:prose-invert prose-sm sm:prose-base focus:outline-none w-full', className),
      },
    },
  });

  const isFirstRender = useRef(true);
  useRef(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
    }
  });

  return (
    <div className={cn("border border-input rounded-md", className)}>
        <TipTapToolbar editor={editor} />
        <EditorContent editor={editor} className="p-2" />
    </div>
  );
};
