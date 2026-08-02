"use client";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

/** Client-side resize + re-encode of an image file to a JPEG data URL, so a photo post
 *  never ships a multi-MB original into a server action body (see next.config.ts
 *  serverActions.bodySizeLimit) or into the NexusPost.imageUrls column it ends up stored
 *  in — there's no file storage configured for this app, so images live inline as data
 *  URLs and need to stay small. */
export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    img.src = objectUrl;
  });
}
