"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./skeleton";

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { CKEditor, CustomEditor } = editorRef.current || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      import("@ckeditor/ckeditor5-react").then((module) => {
        editorRef.current = {
          ...editorRef.current,
          CKEditor: module.CKEditor,
        };
      });
      import("@/lib/ckeditor/custom-editor").then((module) => {
        editorRef.current = {
          ...editorRef.current,
          CustomEditor: module.default,
        };
      });
    }
  }, [isClient]);

  if (!isClient || !CKEditor || !CustomEditor) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <CKEditor
      editor={CustomEditor}
      data={value}
      config={{
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "|",
          "fontFamily",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "link",
          "insertTable",
          "|",
          "imageUpload",
          "|",
          "undo",
          "redo",
        ],
        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "resizeImage",
          ],
          resizeOptions: [
            { name: "resizeImage:original", value: null },
            { name: "resizeImage:50", value: "50" },
            { name: "resizeImage:75", value: "75" },
          ],
        },
        fontFamily: {
          options: [
            "default",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Times New Roman, Times, serif",
            "Verdana, Geneva, sans-serif",
          ],
        },
        fontSize: {
          options: [10, 12, 14, "default", 18, 20, 24, 32],
        },
      }}
      onChange={(event: any, editor: any) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}
