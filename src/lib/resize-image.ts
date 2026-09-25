const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Achica y recomprime una foto en el navegador antes de subirla.
 * Además de ahorrar datos móviles, elimina los metadatos EXIF
 * (que pueden incluir la ubicación GPS de la casa): privacidad por defecto.
 */
export async function resizeImage(file: File, maxDimension = MAX_DIMENSION): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas no disponible');

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob) throw new Error('No se pudo comprimir la imagen');
  return { blob, width, height };
}
