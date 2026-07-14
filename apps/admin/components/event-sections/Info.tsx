import { SectionPanel, inputClass } from "./shared";

export default function Info({
  data = [],
  onChange,
}: {
  data: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <SectionPanel title="Additional Information">
      <label>
        One detail per line
        <textarea
          className={inputClass}
          value={data.join("\n")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
      </label>
    </SectionPanel>
  );
}
