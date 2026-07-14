import RichTextEditor from "../RichTextEditor";
import { SectionPanel, inputClass } from "./shared";

export default function Overview({
  data,
  onChange,
}: {
  data: any;
  onChange: (value: any) => void;
}) {
  const value = data ?? { heading: "", content: "" };
  return (
    <SectionPanel title="Overview">
      <label>
        Heading
        <input
          className={inputClass}
          value={value.heading ?? ""}
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
        />
      </label>
      <label>Overview content</label>
      <RichTextEditor
        value={value.content ?? ""}
        onChange={(content) => onChange({ ...value, content })}
        placeholder="Write the event introduction…"
      />
    </SectionPanel>
  );
}
