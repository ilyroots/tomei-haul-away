import { S3Client, PutObjectCommand, GetObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { logger } from "@/lib/logging/logger";

function getS3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing required S3 configuration.");
  }

  return {
    endpoint: endpoint ?? undefined,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: !!endpoint,
  };
}

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client(getS3Config());
  }
  return s3ClientInstance;
}

export const S3_BUCKET = process.env.S3_BUCKET;

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "")
    .slice(0, 64);
}

export function generateObjectKey(prefix: string, originalName: string): string {
  const extension = extname(originalName) || ".bin";
  const base = sanitizeFilename(originalName.replace(extname(originalName), "")) || "file";
  const unique = uuidv4().replace(/-/g, "").slice(0, 16);
  return `${prefix.replace(/\/$/, "")}/${base}-${unique}${extension}`;
}

export async function uploadToS3(
  buffer: Buffer | Uint8Array,
  originalName: string,
  contentType: string,
  prefix = "uploads"
): Promise<{ key: string; url: string }> {
  if (!S3_BUCKET) {
    throw new Error("S3_BUCKET is not configured.");
  }

  const key = generateObjectKey(prefix, originalName);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: ObjectCannedACL.private,
  });

  await getS3Client().send(command);

  logger.info("Uploaded asset to S3", { key, bucket: S3_BUCKET, contentType });

  return {
    key,
    url: await getSignedDownloadUrl(key, 60 * 60), // 1 hour
  };
}

export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  if (!S3_BUCKET) {
    throw new Error("S3_BUCKET is not configured.");
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: expiresInSeconds });
}
