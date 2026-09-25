import 'server-only';

/** Las fotos llegan ya redimensionadas desde el navegador: esto es un tope de seguridad. */
export const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;

/** Detecta el formato por su firma binaria: el `type` del archivo lo decide el cliente. */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp';
  return null;
}

/** Lee y valida una imagen subida. Devuelve `null` si no es una imagen válida o pesa demasiado. */
export async function readUploadedImage(file: File): Promise<{ data: Uint8Array; mimeType: string } | null> {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return null;
  const data = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageType(data);
  return mimeType ? { data, mimeType } : null;
}
