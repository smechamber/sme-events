import { Trash2 } from "lucide-react";
import SingleImageUpload from "../SingleImageUpload";
import { AddItemButton, SectionPanel, inputClass } from "./shared";

export default function Sponsors({
  data = [],
  onChange,
}: {
  data: any[];
  onChange: (value: any[]) => void;
}) {
  const update = (index: number, field: string, value: string) =>
    onChange(
      data.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  return (
    <SectionPanel title="Sponsors & Partners">
      <div className="repeat-list">
        {data.map((item, index) => (
          <div className="repeat-card" key={index}>
            <button
              className="icon-button remove"
              type="button"
              onClick={() => onChange(data.filter((_, i) => i !== index))}
            >
              <Trash2 size={15} />
            </button>
            <div className="form-grid">
              <label>
                Partner name
                <input
                  className={inputClass}
                  value={item.name ?? ""}
                  onChange={(e) => update(index, "name", e.target.value)}
                />
              </label>
              <label>
                Website
                <input
                  className={inputClass}
                  value={item.website ?? ""}
                  onChange={(e) => update(index, "website", e.target.value)}
                />
              </label>
            </div>
            <SingleImageUpload
              value={item.logo ?? ""}
              onChange={(url) => update(index, "logo", url)}
            />
          </div>
        ))}
      </div>
      <AddItemButton
        onClick={() => onChange([...data, { name: "", logo: "", website: "" }])}
        label="Add partner"
      />
    </SectionPanel>
  );
}
