'use client';

import React, { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [CKEditor, setCKEditor] = useState<any>(null);
  const [ClassicEditor, setClassicEditor] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('@ckeditor/ckeditor5-react'),
      import('@ckeditor/ckeditor5-build-classic')
    ]).then(([ckeditor, classicEditor]) => {
      setCKEditor(() => ckeditor.CKEditor);
      setClassicEditor(() => classicEditor.default);
      setEditorLoaded(true);
    }).catch(error => console.error("Error loading CKEditor:", error));
  }, []);

  if (!editorLoaded || !CKEditor || !ClassicEditor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};
