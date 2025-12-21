import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./CKEditorClient"), {
  ssr: false,
});

export { Editor as RichTextEditor };