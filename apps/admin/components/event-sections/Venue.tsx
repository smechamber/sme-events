import RichTextEditor from "../RichTextEditor";
import { SectionPanel, inputClass } from "./shared";

export default function Venue({
  data,
  onChange,
}: {
  data: any;
  onChange: (value: any) => void;
}) {
  const value = data ?? { name: "", address: "", mapUrl: "", notes: "" };
  return (
    <SectionPanel title="Venue">
      <div className="form-grid">
        <label>
          Venue name
          <input
            className={inputClass}
            value={value.name ?? ""}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </label>
        <label>
          Google Maps link
          <input
            className={inputClass}
            value={value.mapUrl ?? ""}
            onChange={(e) => onChange({ ...value, mapUrl: e.target.value })}
          />
        </label>
      </div>
      <label>
        Full address
        <input
          className={inputClass}
          value={value.address ?? ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </label>
      <label>Additional details</label>
      <RichTextEditor
        value={value.notes ?? ""}
        onChange={(notes) => onChange({ ...value, notes })}
        placeholder="Parking, hall, access information…"
      />
    </SectionPanel>
  );
}
