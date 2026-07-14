import { Trash2 } from "lucide-react";
import { AddItemButton, SectionPanel, inputClass } from "./shared";

export default function Agenda({
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
    <SectionPanel title="Agenda">
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
                Time
                <input
                  className={inputClass}
                  value={item.time ?? ""}
                  onChange={(e) => update(index, "time", e.target.value)}
                />
              </label>
              <label>
                Session title
                <input
                  className={inputClass}
                  value={item.title ?? ""}
                  onChange={(e) => update(index, "title", e.target.value)}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                className={inputClass}
                value={item.description ?? ""}
                onChange={(e) => update(index, "description", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <AddItemButton
        onClick={() =>
          onChange([...data, { time: "", title: "", description: "" }])
        }
        label="Add agenda item"
      />
    </SectionPanel>
  );
}
