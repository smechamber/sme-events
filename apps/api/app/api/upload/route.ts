import { MediaClient } from "@sme/media-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

const media = new MediaClient({
  baseUrl: process.env.MEDIA_SERVER_URL!,
  token: process.env.MEDIA_SERVER_SECRET!,
});

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return response({});
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return response({ error: "FILE_REQUIRED" }, 400);
    }

    const resourceType = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
      ? "image"
      : file.type === "application/pdf"
      ? "document"
      : null;

    if (!resourceType) {
      return response({ error: "UNSUPPORTED_FILE_TYPE" }, 415);
    }

    const maximumSize =
      resourceType === "video"
        ? MAX_VIDEO_SIZE
        : resourceType === "document"
        ? MAX_DOCUMENT_SIZE
        : MAX_IMAGE_SIZE;

    if (file.size > maximumSize) {
      return response({ error: "FILE_TOO_LARGE" }, 413);
    }

    const result = await media.upload(file);

    return response(
      {
        url: result.secureUrl,
        publicId: result.id,
        resourceType: result.resourceType,
      },
      201
    );
  } catch (error) {
    console.error("Media upload failed", error);

    return response(
      {
        error: "UPLOAD_FAILED",
      },
      500
    );
  }
}