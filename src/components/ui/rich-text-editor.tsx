"use client";

import dynamic from "next/dynamic";
import React from "react";
import RichTextEditorBuild from "@/lib/ckeditor/custom-editor";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((m) => m.CKEditor),
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <div className={className}>
      <CKEditor
        editor={RichTextEditorBuild}
        data={value}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
};

export { RichTextEditor };
