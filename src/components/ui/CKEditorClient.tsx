"use client";

import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    ClassicEditor,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Paragraph,
    Essentials,
    Heading,
    Link,
    List,
    BlockQuote,
    RemoveFormat,
    FontFamily,
    FontSize,
    FontColor,
    FontBackgroundColor,
    Alignment,
    Image,
    ImageToolbar,
    ImageStyle,
    ImageResize,
    ImageUpload,
    ImageCaption,
    Table,
    Autoformat,
    SimpleUploadAdapter,
    PasteFromOffice,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './ckeditor-styles.css';

interface CKEditorClientProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CKEditorClient({ value, onChange }: CKEditorClientProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Paragraph,
            Heading,
            Link,
            List,
            BlockQuote,
            RemoveFormat,
            FontFamily,
            FontSize,
            FontColor,
            FontBackgroundColor,
            Alignment,
            Image,
            ImageToolbar,
            ImageStyle,
            ImageResize,
            ImageUpload,
            ImageCaption,
            Table,
            Autoformat,
            SimpleUploadAdapter,
            PasteFromOffice,
        ],
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
          "numberedList",
          "bulletedList",
          "|",
          "link",
          "insertTable",
          "blockQuote",
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
            "|",
            "resizeImage"
          ],
          resizeOptions: [
            {
              name: "resizeImage:original",
              label: "Original",
              value: null
            },
            {
              name: "resizeImage:50",
              label: "50%",
              value: "50"
            },
            {
              name: "resizeImage:75",
              label: "75%",
              value: "75"
            }
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
          options: [10, 12, 14, "default", 18, 20, 24, 32]
        }
      }}
      onChange={(event, editor) => {
        onChange(editor.getData());
      }}
    />
  );
}
