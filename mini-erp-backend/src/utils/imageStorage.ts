import fs from "fs";
import path from "path";
import { uploadBufferToCloudinary } from "../config/cloudinary";

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads", "products");
const PLACEHOLDER_VALUES = new Set(["your_cloud_name", "your_api_key", "your_api_secret", ""]);

function isCloudinaryConfigured(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET].every(
    (value) => value && !PLACEHOLDER_VALUES.has(value)
  );
}

function saveBufferLocally(buffer: Buffer, originalName: string): { url: string; publicId: string } {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
  return { url: `${baseUrl}/uploads/products/${filename}`, publicId: filename };
}

/**
 * Uploads to Cloudinary when real credentials are configured; otherwise
 * falls back to local disk. Render/Railway free tiers have ephemeral
 * disks, so the local path is dev-only — production must set real
 * Cloudinary env vars (see .env.example).
 */
export async function uploadProductImage(
  buffer: Buffer,
  originalName: string
): Promise<{ url: string; publicId: string }> {
  if (isCloudinaryConfigured()) {
    return uploadBufferToCloudinary(buffer, "mini-erp/products");
  }
  return saveBufferLocally(buffer, originalName);
}
