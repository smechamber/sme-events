import { CloudinaryUpload } from "./cloudinary-upload";

export default function MultiImageUpload({ value, onChange }: { value?: string[]; onChange: (urls: string[]) => void }) {
  return <CloudinaryUpload values={value ?? []} onChangeMany={onChange} kind="image" />;
}
