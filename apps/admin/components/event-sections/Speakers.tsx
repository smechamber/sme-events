import { Trash2 } from "lucide-react";
import SingleImageUpload from "../SingleImageUpload";
import { AddItemButton, SectionPanel, inputClass } from "./shared";

export default function Speakers({
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
    <SectionPanel title="Speakers">
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
            <div className="form-grid three">
              <label>
                Name
                <input
                  className={inputClass}
                  value={item.name ?? ""}
                  onChange={(e) => update(index, "name", e.target.value)}
                />
              </label>
              <label>
                Role
                <input
                  className={inputClass}
                  value={item.role ?? ""}
                  onChange={(e) => update(index, "role", e.target.value)}
                />
              </label>
              <label>
                Company
                <input
                  className={inputClass}
                  value={item.company ?? ""}
                  onChange={(e) => update(index, "company", e.target.value)}
                />
              </label>
            </div>
            <SingleImageUpload
              value={item.image ?? ""}
              onChange={(url) => update(index, "image", url)}
            />
          </div>
        ))}
      </div>
      <AddItemButton
        onClick={() =>
          onChange([...data, { name: "", role: "", company: "", image: "" }])
        }
        label="Add speaker"
      />
    </SectionPanel>
  );
}
