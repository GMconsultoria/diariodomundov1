import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./_core/env";

// Configure Cloudinary
if (ENV.cloudinaryCloudName && ENV.cloudinaryApiKey && ENV.cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: ENV.cloudinaryCloudName,
    api_key: ENV.cloudinaryApiKey,
    api_secret: ENV.cloudinaryApiSecret,
  });
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  if (!ENV.cloudinaryCloudName) {
    throw new Error("Cloudinary configuration missing");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "diariodomundo",
        public_id: normalizeKey(relKey).split(".")[0],
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        if (!result) return reject(new Error("Cloudinary returned empty result"));
        
        resolve({
          key: result.public_id,
          url: result.secure_url,
        });
      }
    );

    // Convert Buffer/Uint8Array/string to Buffer for upload_stream
    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else {
      buffer = Buffer.from(data);
    }

    uploadStream.end(buffer);
  });
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  // Cloudinary URLs are absolute, but for consistency we return them
  // This helper might need specific implementation if needed
  return { key: relKey, url: relKey };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  // Cloudinary secure URLs are usually public but can be signed if configured
  return relKey;
}
