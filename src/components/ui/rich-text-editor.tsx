'use client';

import dynamic from "next/dynamic";
import React from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((m) => m.CKEditor),
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
            toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "|",
                "alignment",
                "|",
                "bulletedList",
                "numberedList",
                "|",
                "link",
                "imageUpload",
                "blockQuote",
                "|",
                "undo",
                "redo",
            ],
        }}
      />
    </div>
  );
};

export { RichTextEditor };
