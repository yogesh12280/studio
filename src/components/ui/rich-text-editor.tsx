'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Skeleton } from './skeleton';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);
  const { CKEditor, CustomEditor } = editorRef.current || {};
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    import('@ckeditor/ckeditor5-react').then(editorModule => {
        import('@/lib/ckeditor/custom-editor').then(customEditorModule => {
            editorRef.current = {
                CKEditor: editorModule.CKEditor,
                CustomEditor: customEditorModule.default,
            };
            setIsMounted(true);
        });
    });

    return () => {
        setIsMounted(false);
    }
  }, []);
  
  if (!isMounted || !CKEditor || !CustomEditor) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className={className}>
      <CKEditor
        editor={CustomEditor}
        data={value}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: {
            items: [
              'heading',
              '|',
              'fontFamily',
              'fontSize',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'alignment',
              '|',
              'numberedList',
              'bulletedList',
              '|',
              'outdent',
              'indent',
              '|',
              'link',
              'imageUpload',
              'blockQuote',
              'insertTable',
              '|',
              'removeFormat',
              '|',
              'undo',
              'redo',
            ],
          },
          image: {
            resizeUnit: 'px',
            toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'linkImage'
            ],
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
        }}
      />
    </div>
  );
};
