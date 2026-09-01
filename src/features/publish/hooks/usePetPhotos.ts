'use client';

import { useCallback, useState } from 'react';

import { createId } from '@/lib/format';
import { MAX_PHOTOS, MAX_PHOTO_SIZE_MB } from '../lib/publish-schema';
import type { PetPhoto } from '../types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];

interface UsePetPhotosResult {
  addFiles: (files: FileList | File[]) => void;
  removePhoto: (id: string) => void;
  makePrimary: (id: string) => void;
  uploadError: string | null;
}

/**
 * Encapsula la gestión de archivos y sus URLs de preview.
 * Los componentes de UI solo reciben `PetPhoto[]` y callbacks.
 *
 * Cada URL se revoca al quitar la foto, nunca al desmontar: la publicación
 * ya creada sigue mostrando esa misma URL en la galería.
 */
export function usePetPhotos(
  photos: PetPhoto[],
  onChange: (photos: PetPhoto[]) => void,
): UsePetPhotosResult {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const availableSlots = MAX_PHOTOS - photos.length;

      if (availableSlots <= 0) {
        setUploadError(`Ya subiste el máximo de ${MAX_PHOTOS} fotos`);
        return;
      }

      const rejected: string[] = [];
      const accepted: PetPhoto[] = [];

      for (const file of files.slice(0, availableSlots)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          rejected.push(`${file.name} no es una imagen`);
          continue;
        }
        if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
          rejected.push(`${file.name} pesa más de ${MAX_PHOTO_SIZE_MB} MB`);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        accepted.push({ id: createId('foto'), file, previewUrl, fileName: file.name });
      }

      if (files.length > availableSlots) {
        rejected.push(`Solo entran ${MAX_PHOTOS} fotos`);
      }

      setUploadError(rejected[0] ?? null);
      if (accepted.length > 0) {
        onChange([...photos, ...accepted]);
      }
    },
    [onChange, photos],
  );

  const removePhoto = useCallback(
    (id: string) => {
      const target = photos.find((photo) => photo.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      setUploadError(null);
      onChange(photos.filter((photo) => photo.id !== id));
    },
    [onChange, photos],
  );

  const makePrimary = useCallback(
    (id: string) => {
      const target = photos.find((photo) => photo.id === id);
      if (!target) return;
      onChange([target, ...photos.filter((photo) => photo.id !== id)]);
    },
    [onChange, photos],
  );

  return { addFiles, removePhoto, makePrimary, uploadError };
}
