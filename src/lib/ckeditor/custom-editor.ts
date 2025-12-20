// Your-custom-build/src/ckeditor.ts
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

// Essentials
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";

// Text styles
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";

// Font plugins
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor";
import FontBackgroundColor from "@ckeditor/ckeditor5-font/src/fontbackgroundcolor";

// Alignment
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";

// Lists & Indent
import List from "@ckeditor/ckeditor5-list/src/list";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";

// Link
import Link from "@ckeditor/ckeditor5-link/src/link";

// Image
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";

// Blockquote
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";

// Undo / Redo
import Undo from "@ckeditor/ckeditor5-undo/src/undo";

import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';


export default class CustomEditor extends ClassicEditor {}

CustomEditor.builtinPlugins = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
  Alignment,
  List,
  Indent,
  Link,
  Image,
  ImageToolbar,
  ImageStyle,
  ImageUpload,
  ImageCaption,
  BlockQuote,
  Undo,
  Base64UploadAdapter
];

CustomEditor.defaultConfig = {
  toolbar: {
    items: [
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
      "imageUpload",
      "blockQuote",
      "|",
      "undo",
      "redo"
    ],
    shouldNotGroupWhenFull: true
  },

  fontFamily: {
    options: [
      "default",
      "Arial, Helvetica, sans-serif",
      "Courier New, Courier, monospace",
      "Georgia, serif",
      "Times New Roman, Times, serif",
      "Verdana, Geneva, sans-serif"
    ],
    supportAllValues: true
  },

  fontSize: {
    options: [10, 12, 14, "default", 18, 20, 24, 32],
    supportAllValues: true
  },

  image: {
    toolbar: [
      "imageTextAlternative",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side"
    ]
  },

  language: "en"
};
