'use client';

import dynamic from "next/dynamic";
import { Skeleton } from "./skeleton";

const Editor = dynamic(() => import("./CKEditorClient"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});

export default Editor;
