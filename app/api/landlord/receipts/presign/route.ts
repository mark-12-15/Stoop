import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/storage/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const ALLOWED = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024;
const BUCKET = "receipts";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, size } = await request.json() as {
    filename: string; contentType: string; size: number;
  };

  if (!ALLOWED.includes(contentType))
    return NextResponse.json({ error: "Only images and PDFs allowed" }, { status: 400 });
  if (size > MAX_SIZE)
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `receipts/${session.user.id}/${randomUUID()}.${ext}`;

  const r2 = createR2Client();
  if (r2) {
    const cmd = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 300 });
    return NextResponse.json({ uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` });
  }

  // Local dev: Supabase Storage
  const admin = createAdminClient();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(key);
  if (error || !data) return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  return NextResponse.json({
    uploadUrl: data.signedUrl,
    publicUrl: `${base}/storage/v1/object/public/${BUCKET}/${key}`,
  });
}
