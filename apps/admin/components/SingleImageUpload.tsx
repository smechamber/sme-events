import ImageUpload from "./ImageUpload";

export default function SingleImageUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ImageUpload value={value} onChange={onChange} />;
}
