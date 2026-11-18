import { api } from './api';

/** Shrink big photos in the browser before upload (≤1800px, WebP) — much faster to upload and to load on the site. */
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 250 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.85));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }) : file;
  } catch {
    return file;
  }
}

/** Upload one image straight to S3 (presigned POST from our API). Resolves to the public CDN URL. */
export async function uploadImage(file, folder) {
  const f = await shrink(file);
  const sign = await api('/admin/uploads/presign', { method: 'POST', body: { contentType: f.type, folder } });
  if (f.size > sign.maxMb * 1024 * 1024) throw new Error(`"${file.name}" is larger than ${sign.maxMb} MB`);
  const fd = new FormData();
  Object.entries(sign.fields).forEach(([k, v]) => fd.append(k, v));
  fd.append('file', f); // must be last
  const res = await fetch(sign.url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload to storage failed. Check the bucket CORS settings (see README).');
  return sign.publicUrl;
}
