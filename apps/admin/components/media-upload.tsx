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
  kind?: "image" | "video" | "document";
  label?: string;
};

export function MediaUpload({
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
            process.env.NEXT_PUBLIC_API_URL ??
            "http://localhost:3002/api";

          const response = await fetch(`${apiUrl}/upload`, {
            method: "POST",
            body,
          });

          if (!response.ok) {
            throw new Error("UPLOAD_FAILED");
          }

          const result = await response.json();

          return result.url;
        })
      );

      if (multiple) {
        onChangeMany?.([...(values ?? []), ...urls]);
      } else {
        onChange?.(urls[0]);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Upload failed. Please check the Media Server connection."
      );
    } finally {
      setUploading(false);
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) =>
    void upload(event.target.files);

  const Icon =
    kind === "video"
      ? Video
      : kind === "document"
      ? FileText
      : ImagePlus;

  const current = values ?? (value ? [value] : []);

  return (
    <div className="media-uploader">
      {label ? <p className="field-label">{label}</p> : null}

      <label
        className={`upload-dropzone ${
          uploading ? "is-uploading" : ""
        }`}
      >
        <input
          type="file"
          accept={
            kind === "video"
              ? "video/*"
              : kind === "document"
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
            ? "Uploading..."
            : `Upload ${multiple ? `${kind}s` : kind}`}
        </span>

        <small>
          {kind === "document"
            ? "PDF"
            : kind === "video"
            ? "MP4, MOV, AVI, WEBM"
            : "JPG, PNG, WEBP"}
        </small>
      </label>

      {error && (
        <p className="upload-error">{error}</p>
      )}

      {current.length > 0 && (
        <div className="upload-preview-grid">
          {current.map((url, index) => (
            <div
              className="upload-preview"
              key={`${url}-${index}`}
            >
              {kind === "video" ? (
                <video src={url} controls />
              ) : kind === "document" ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={34} />
                  PDF
                </a>
              ) : (
                <img
                  src={url}
                  alt="Uploaded media"
                />
              )}

              <button
                type="button"
                aria-label="Remove media"
                onClick={() =>
                  multiple
                    ? onChangeMany?.(
                        current.filter(
                          (_, itemIndex) => itemIndex !== index
                        )
                      )
                    : onChange?.("")
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!current.length && !uploading && (
        <p className="upload-or">
          <Upload size={13} /> or paste a hosted URL below
        </p>
      )}

      {!multiple && (
        <input
          value={value ?? ""}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          placeholder={`Paste ${kind} URL`}
        />
      )}
    </div>
  );
}