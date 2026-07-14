import { Plus } from "lucide-react";

export function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function AddItemButton({
  onClick,
  label = "Add item",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button className="add-row" type="button" onClick={onClick}>
      <Plus size={16} /> {label}
    </button>
  );
}

export const inputClass = "section-input";
