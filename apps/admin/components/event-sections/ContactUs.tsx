import { SectionPanel, inputClass } from "./shared";

export default function ContactUs({
  data,
  onChange,
}: {
  data: any;
  onChange: (value: any) => void;
}) {
  const value = data ?? { email: "", phone: "", person: "" };
  return (
    <SectionPanel title="Contact Information">
      <div className="form-grid three">
        <label>
          Email
          <input
            className={inputClass}
            value={value.email ?? ""}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            className={inputClass}
            value={value.phone ?? ""}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </label>
        <label>
          Contact person
          <input
            className={inputClass}
            value={value.person ?? ""}
            onChange={(e) => onChange({ ...value, person: e.target.value })}
          />
        </label>
      </div>
    </SectionPanel>
  );
}
