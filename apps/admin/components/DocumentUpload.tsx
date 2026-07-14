import { CloudinaryUpload } from "./cloudinary-upload";

export default function DocumentUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  return <CloudinaryUpload value={value} onChange={onChange} kind="raw" />;
}
