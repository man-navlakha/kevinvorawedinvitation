import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.DB_url),
    activeProvider: "database",
    databaseConfigured: Boolean(process.env.DB_url),
    mediaProvider: "cloudinary",
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_URL),
  });
}

