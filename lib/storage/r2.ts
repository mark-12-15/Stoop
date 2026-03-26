import { S3Client } from "@aws-sdk/client-s3";

export function createR2Client(): S3Client | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "stoopkeep";
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
