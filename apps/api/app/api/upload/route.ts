import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function OPTIONS() {
  return response({});
}

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return response({ error: "CLOUDINARY_NOT_CONFIGURED" }, 500);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return response({ error: "FILE_REQUIRED" }, 400);

    const resourceType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "raw" : null;
    if (!resourceType) return response({ error: "UNSUPPORTED_FILE_TYPE" }, 415);
    const maximumSize = resourceType === "video" ? MAX_VIDEO_SIZE : resourceType === "raw" ? MAX_DOCUMENT_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maximumSize) return response({ error: "FILE_TOO_LARGE" }, 413);

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string; public_id: string; resource_type: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "sme-events", resource_type: resourceType }, (error, upload) => {
        if (error || !upload) reject(error ?? new Error("CLOUDINARY_UPLOAD_FAILED"));
        else resolve(upload as { secure_url: string; public_id: string; resource_type: string });
      });
      stream.end(bytes);
    });

    return response({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type }, 201);
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return response({ error: "UPLOAD_FAILED" }, 500);
  }
}
