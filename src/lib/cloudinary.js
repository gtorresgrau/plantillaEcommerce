// src/lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Subir imagen desde base64 o URL ─────────────────────────────────────────
export async function uploadImage(file, folder = 'productos') {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  });
  return {
    url:       result.secure_url,
    publicId:  result.public_id,
    width:     result.width,
    height:    result.height,
    format:    result.format,
  };
}

// ─── Subir logo/branding (con transformaciones específicas) ───────────────────
export async function uploadLogo(file, folder = 'branding') {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:best', fetch_format: 'auto' },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

// ─── Eliminar imagen ──────────────────────────────────────────────────────────
export async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

// ─── Generar URL con transformaciones on-the-fly ─────────────────────────────
export function getOptimizedUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
}
