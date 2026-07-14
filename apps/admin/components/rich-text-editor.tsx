"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="editor-loading">Loading editor…</div> });

export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const modules = useMemo(() => ({ toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline"], [{ align: [] }], [{ color: [] }, { background: [] }], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] }), []);
  return <ReactQuill theme="snow" value={value || ""} onChange={onChange} modules={modules} placeholder={placeholder ?? "Start writing…"} />;
}
