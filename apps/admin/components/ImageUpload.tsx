import { MediaUpload } from "./media-upload";

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <MediaUpload
      value={value}
      onChange={onChange}
      kind="image"
    />
  );
}