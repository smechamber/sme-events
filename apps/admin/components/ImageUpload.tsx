import { CloudinaryUpload } from "./cloudinary-upload";

export default function ImageUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <CloudinaryUpload value={value} onChange={onChange} kind="image" />;
}
