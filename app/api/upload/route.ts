import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

if (process.env.CLOUDINARY_URL?.startsWith("cloudinary:/") && !process.env.CLOUDINARY_URL.startsWith("cloudinary://")) {
  process.env.CLOUDINARY_URL = process.env.CLOUDINARY_URL.replace(/^cloudinary:\//, "cloudinary://");
}

async function uploadToCloudinary(buffer: Buffer, fileName: string, resourceType: "image" | "video") {
  const { v2: cloudinary } = await import("cloudinary");
  return new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "kevin-vora-wedding",
        resource_type: resourceType,
        public_id: fileName.replace(/\.[^/.]+$/, ""),
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary did not return an upload result."));
          return;
        }
        resolve({ secure_url: result.secure_url, bytes: result.bytes });
      }
    );
    upload.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: "Files larger than 50MB are not supported." },
        { status: 413 }
      );
    }

    const resourceType = file.type.startsWith("image/") ? "image" : "video";
    const result = await uploadToCloudinary(
      Buffer.from(await file.arrayBuffer()),
      `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      resourceType
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      fileName: file.name,
      size: result.bytes,
    });
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Cloudinary upload failed." },
      { status: 500 }
    );
  }
}

