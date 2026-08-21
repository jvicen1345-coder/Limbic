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

/** Reads a File directly to a data URL with no re-encoding — used for CE certificate PDFs
 *  (see readCertificateFileToDataUrl below), which can't be re-compressed through a canvas
 *  the way compressImageToDataUrl re-encodes a photo. Rejects before ever reading the file
 *  if it's already over maxBytes, so a large PDF doesn't get fully loaded into memory just
 *  to be rejected afterward. */
function readFileToDataUrl(file: File, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`File is too large (max ${Math.round(maxBytes / 1_000_000)}MB).`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// Matches MAX_CERTIFICATE_DATA_URL_LENGTH's server-side check in app/actions/pro-toolbox.ts
// — kept in bytes here (pre-encoding) since a data URL's base64 body runs about a third
// larger than the raw file, so checking the raw file size first catches an oversized upload
// before doing any work, not just after.
const MAX_CERTIFICATE_FILE_BYTES = 2_000_000;

/** CE Hours Tracker's "Upload certificate" (see CELogForm.tsx) — accepts either an image
 *  (compressed the same way as a Nexus photo post, see compressImageToDataUrl above) or a
 *  PDF (read through as-is; a PDF can't be re-compressed via canvas the way a photo can).
 *  Same "no file storage configured, store a capped data URL inline" reasoning as every
 *  other upload in this app. */
export function readCertificateFileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") return readFileToDataUrl(file, MAX_CERTIFICATE_FILE_BYTES);
  if (file.type.startsWith("image/")) return compressImageToDataUrl(file);
  return Promise.reject(new Error("Certificate must be an image or a PDF."));
}
