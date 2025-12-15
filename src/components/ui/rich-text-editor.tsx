'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { useCallback, useRef } from 'react';
import { Bold, Italic, Strikethrough, Code, Image as ImageIcon, Pilcrow, Minus, Table as TableIcon, Trash2 } from 'lucide-react';
import {
    Columns,
    Rows,
    Heading1,
    Heading2,
    Heading3,
    WrapText,
    List,
    ListOrdered
} from 'lucide-react'
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
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        onClick={addImage}
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8"
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
      <Separator orientation="vertical" className="h-6" />
        <Button
            onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
        >
            <TableIcon className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
        >
            <Columns className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8 rotate-180'
        >
            <Columns className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
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
        >
            <Rows className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            variant='ghost'
            size='icon'
            type='button'
className='h-8 w-8 rotate-180'
        >
            <Rows className='h-4 w-4' />
        </Button>
        <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
            variant='ghost'
            size='icon'
            type='button'
            className='h-8 w-8'
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
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px]',
      },
    },
  });

  // This is a workaround to update the editor content when the external value changes.
  // It's not ideal, but it prevents the infinite loop.
  const isFirstRender = useRef(true);
  useRef(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className={cn("border border-input rounded-md", className)}>
        <TipTapToolbar editor={editor} />
        <EditorContent editor={editor} />
    </div>
  );
};
