
'use client';

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  className?: string;
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'fontFamily',
            'fontSize',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'link',
            'imageUpload',
            'blockQuote',
            '|',
            'undo',
            'redo',
          ],
        }}
      />
    </div>
  );
}
