"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import CustomEditor from "@/lib/ckeditor/custom-editor";
import { FC } from 'react';

interface CKEditorClientProps {
  value: string;
  onChange: (data: string) => void;
}

const CKEditorClient: FC<CKEditorClientProps> = ({ value, onChange }) => {
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
          "redo"
        ],

        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "resizeImage"
          ],
          resizeOptions: [
            { name: "resizeImage:original", value: null },
            { name: "resizeImage:50", value: "50" },
            { name: "resizeImage:75", value: "75" }
          ]
        },

        fontFamily: {
          options: [
            "default",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Times New Roman, Times, serif",
            "Verdana, Geneva, sans-serif"
          ]
        },

        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 24, 32]
        }
      }}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}

export default CKEditorClient;