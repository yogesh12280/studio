'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from './skeleton';

// Dynamically import to ensure it's client-side only
const CKEditor = (props: any) => {
  const { CKEditor: CKEditorComponent, CustomEditor } = props.editorModule;
  return (
    <CKEditorComponent
      editor={CustomEditor}
      data={props.value}
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
          'insertTable',
          '|',
          'imageUpload',
          '|',
          'undo',
          'redo',
        ],
        image: {
          toolbar: [
            'imageTextAlternative',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            'resizeImage',
          ],
          resizeOptions: [
            { name: 'resizeImage:original', value: null },
            { name: 'resizeImage:50', value: '50' },
            { name: 'resizeImage:75', value: '75' },
          ],
        },
        fontFamily: {
          options: [
            'default',
            'Arial, Helvetica, sans-serif',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Times New Roman, Times, serif',
            'Verdana, Geneva, sans-serif',
          ],
        },
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 24, 32],
        },
      }}
      onChange={(event: any, editor: any) => {
        props.onChange(editor.getData());
      }}
    />
  );
};


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Dynamically import the editor and the build
    import('@ckeditor/ckeditor5-react')
      .then(editorModule => {
        import('@/lib/ckeditor/custom-editor')
          .then(customEditorModule => {
            editorRef.current = {
              CKEditor: editorModule.CKEditor,
              CustomEditor: customEditorModule.default,
            };
            setIsMounted(true);
          })
          .catch(error => {
            console.error("Error loading custom editor build:", error);
          });
      })
      .catch(error => {
        console.error("Error loading CKEditor component:", error);
      });
  }, []);

  if (!isMounted || !editorRef.current) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className={className}>
      <CKEditor editorModule={editorRef.current} value={value} onChange={onChange} />
    </div>
  );
};
