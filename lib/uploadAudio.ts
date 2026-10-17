"use client";

import { safeFetchJson } from "@/lib/apiHelper";

export const MAX_AUDIO_UPLOAD_BYTES = 50 * 1024 * 1024;

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadAudioToStorage(file: Blob, fileName: string): Promise<string> {
  const safeName = cleanFileName(fileName || `wedding-audio-${Date.now()}.mp3`);
  const formData = new FormData();
  formData.append("file", file, safeName);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const result = await safeFetchJson<{ success?: boolean; url?: string; error?: string }>(
    response,
    "Cloudinary audio upload"
  );
  if (!response.ok || !result.success || !result.url) {
    throw new Error(result.error || "Cloudinary audio upload failed.");
  }
  return result.url;
}

