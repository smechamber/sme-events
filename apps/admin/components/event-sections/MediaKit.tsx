import { Trash2 } from "lucide-react";
import DocumentUpload from "../DocumentUpload";
import MultiVideoUpload from "../MultiVideoUpload";
import { AddItemButton, SectionPanel, inputClass } from "./shared";

export default function MediaKit({
  data,
  onChange,
}: {
  data: any;
  onChange: (value: any) => void;
}) {
  const value = data ?? { title: "", description: "", files: [], videos: [] };
  const files = value.files ?? [];
  return (
    <SectionPanel title="Media Kit, Brochure & Videos">
      <div className="form-grid">
        <label>
          Title
          <input
            className={inputClass}
            value={value.title ?? ""}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </label>
        <label>
          Description
          <input
            className={inputClass}
            value={value.description ?? ""}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
          />
        </label>
      </div>
      <div className="repeat-list">
        {files.map((file: any, index: number) => (
          <div className="repeat-card" key={index}>
            <button
              className="icon-button remove"
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  files: files.filter((_: any, i: number) => i !== index),
                })
              }
            >
              <Trash2 size={15} />
            </button>
            <label>
              Brochure label
              <input
                className={inputClass}
                value={file.label ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    files: files.map((item: any, i: number) =>
                      i === index ? { ...item, label: e.target.value } : item,
                    ),
                  })
                }
              />
            </label>
            <DocumentUpload
              value={file.url ?? ""}
              onChange={(url) =>
                onChange({
                  ...value,
                  files: files.map((item: any, i: number) =>
                    i === index ? { ...item, url } : item,
                  ),
                })
              }
            />
          </div>
        ))}
      </div>
      <AddItemButton
        onClick={() =>
          onChange({ ...value, files: [...files, { label: "", url: "" }] })
        }
        label="Add brochure"
      />
      <MultiVideoUpload
        value={value.videos ?? []}
        onChange={(videos) => onChange({ ...value, videos })}
      />
    </SectionPanel>
  );
}
