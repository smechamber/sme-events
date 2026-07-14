import { CloudinaryUpload } from "./cloudinary-upload";

export default function MultiVideoUpload({ value, onChange }: { value?: string[]; onChange: (urls: string[]) => void }) {
  return <CloudinaryUpload values={value ?? []} onChangeMany={onChange} kind="video" />;
}
