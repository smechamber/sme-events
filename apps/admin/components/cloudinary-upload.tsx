"use client";

import {
  FileText,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { ChangeEvent, useState } from "react";

type Props = {
  value?: string;
  values?: string[];
  onChange?: (url: string) => void;
  onChangeMany?: (urls: string[]) => void;
  kind?: "image" | "video" | "raw";
  label?: string;
};

export function CloudinaryUpload({
  value,
  values,
  onChange,
  onChangeMany,
  kind = "image",
  label,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const multiple = Boolean(onChangeMany);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";
          const response = await fetch(`${apiUrl}/upload`, {
            method: "POST",
            body,
          });
          if (!response.ok) throw new Error("UPLOAD_FAILED");
          return ((await response.json()) as { url: string }).url;
        }),
      );
      if (multiple) onChangeMany?.([...(values ?? []), ...urls]);
      else onChange?.(urls[0]);
    } catch {
      setError(
        "Upload failed. Check the API server and its Cloudinary environment variables.",
      );
    } finally {
      setUploading(false);
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) =>
    void upload(event.target.files);
  const Icon = kind === "video" ? Video : kind === "raw" ? FileText : ImagePlus;
  const current = values ?? (value ? [value] : []);
  return (
    <div className="media-uploader">
      {label ? <p className="field-label">{label}</p> : null}
      <label className={`upload-dropzone ${uploading ? "is-uploading" : ""}`}>
        <input
          type="file"
          accept={
            kind === "video"
              ? "video/*"
              : kind === "raw"
                ? ".pdf,application/pdf"
                : "image/*"
          }
          multiple={multiple}
          onChange={onFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <LoaderCircle className="spin" size={22} />
        ) : (
          <Icon size={22} />
        )}
        <span>
          {uploading
            ? "Uploading to Cloudinary…"
            : `Upload ${multiple ? `${kind}s` : kind}`}
        </span>
        <small>
          {kind === "raw"
            ? "PDF"
            : `JPG, PNG, WEBP${kind === "video" ? ", MP4" : ""}`}
        </small>
      </label>
      {error ? <p className="upload-error">{error}</p> : null}
      {current.length ? (
        <div className="upload-preview-grid">
          {current.map((url, index) => (
            <div className="upload-preview" key={`${url}-${index}`}>
              {kind === "video" ? (
                <video src={url} controls />
              ) : kind === "raw" ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <FileText size={34} /> PDF
                </a>
              ) : (
                <img src={url} alt="Uploaded media" />
              )}
              <button
                type="button"
                aria-label="Remove media"
                onClick={() =>
                  multiple
                    ? onChangeMany?.(
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    : onChange?.("")
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {!current.length && !uploading ? (
        <p className="upload-or">
          <Upload size={13} /> or paste a hosted URL below
        </p>
      ) : null}
      {!multiple ? (
        <input
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={`Paste ${kind} URL`}
        />
      ) : null}
    </div>
  );
}
