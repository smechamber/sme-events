import { MediaUpload } from "./media-upload";

export default function MultiVideoUpload({
  value,
  onChange,
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
}) {
  return (
    <MediaUpload
      values={value ?? []}
      onChangeMany={onChange}
      kind="video"
    />
  );
}