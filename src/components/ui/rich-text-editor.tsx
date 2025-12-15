'use client';

import React from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};

const RichTextEditorWithRef = React.forwardRef<ReactQuill, RichTextEditorProps>(({ value, onChange, className }, ref) => {
  return (
    <div className={className}>
      <ReactQuill
        ref={ref}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="bg-background"
      />
    </div>
  );
});

RichTextEditorWithRef.displayName = 'RichTextEditor';

export { RichTextEditorWithRef as RichTextEditor };
