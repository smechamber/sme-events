import { MediaUpload } from "./media-upload";

export default function DocumentUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <MediaUpload
      value={value}
      onChange={onChange}
      kind="document"
    />
  );
}