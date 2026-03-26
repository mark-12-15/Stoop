import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/storage/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPABASE_BUCKET = "tenant-photos";

export async function POST(request: Request) {
  const body = await request.json();
  const { filename, contentType, size } = body as { filename: string; contentType: string; size: number };

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${randomUUID()}.${ext}`;

  // Use R2 if configured, fall back to local Supabase Storage for dev
  const r2 = createR2Client();
  if (r2) {
    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: `tenant-photos/${key}`, ContentType: contentType });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    const publicUrl = `${R2_PUBLIC_URL}/tenant-photos/${key}`;
    return NextResponse.json({ uploadUrl, publicUrl });
  }

  // Local dev fallback: Supabase Storage
  const supabase = createAdminClient();
  // Ensure bucket exists (no-op if already exists)
  await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true }).catch(() => {});
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).createSignedUploadUrl(key);
  if (error || !data) {
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
  return NextResponse.json({ uploadUrl: data.signedUrl, publicUrl });
}
