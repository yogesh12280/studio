"use client";

import dynamic from "next/dynamic";
import React from "react";
import Editor from "@ckeditor/ckeditor5-build-classic";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((m) => m.CKEditor),
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  className?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
  readOnly = false
}) => {
  return (
    <div className={className}>
      <CKEditor
        editor={Editor}
        data={value}
        disabled={readOnly}
        config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'alignment',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'undo',
            'redo',
          ],
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
};

export { RichTextEditor };
