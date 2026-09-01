'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';

import { CloseIcon, UploadIcon } from '@/components/icons';
import { FieldError } from '@/components/ui/FieldError';
import { cn } from '@/lib/cn';
import { usePetPhotos } from '../hooks/usePetPhotos';
import { MAX_PHOTOS } from '../lib/publish-schema';
import type { PetPhoto } from '../types';

interface PhotoUploaderProps {
  photos: PetPhoto[];
  onChange: (photos: PetPhoto[]) => void;
  error?: string;
  petName: string;
}

export function PhotoUploader({ photos, onChange, error, petName }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { addFiles, removePhoto, makePrimary, uploadError } = usePetPhotos(photos, onChange);

  const isFull = photos.length >= MAX_PHOTOS;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink-700">Fotos de {petName}</p>
        <span className="text-xs tabular-nums text-ink-400">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          'relative rounded-panel border-2 border-dashed p-5 transition-colors duration-200 ease-soft',
          isDragging ? 'border-clay-500 bg-clay-50' : 'border-cream-400 bg-cream-50',
          isFull && 'opacity-60',
        )}
      >
        <input
          ref={inputRef}
          id="pet-photos"
          type="file"
          accept="image/*"
          multiple
          disabled={isFull}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <label
          htmlFor="pet-photos"
          className="flex flex-col items-center gap-2 py-4 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay-100 text-clay-600">
            <UploadIcon size={22} />
          </span>
          <span className="text-sm font-semibold text-ink-900">
            {isFull ? 'Ya tenés todas las fotos' : 'Arrastrá o elegí sus fotos'}
          </span>
          <span className="text-xs text-ink-400">JPG, PNG o WEBP · hasta 8 MB cada una</span>
        </label>

        {photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <AnimatePresence initial={false}>
              {photos.map((photo, index) => (
                <motion.li
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative aspect-square overflow-hidden rounded-card border border-cream-400 bg-white"
                >
                  {/* Preview local: es un blob:, no pasa por el optimizador de imágenes. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Vista previa ${index + 1} de ${petName}: ${photo.fileName}`}
                    className="h-full w-full object-cover"
                  />

                  {index === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-pill bg-ink-900/80 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makePrimary(photo.id)}
                      className="absolute inset-x-1.5 bottom-1.5 rounded-pill bg-white/90 py-1 text-[0.65rem] font-semibold text-ink-700 opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      Hacer principal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    aria-label={`Quitar la foto ${photo.fileName}`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-700 transition-colors hover:bg-white hover:text-clay-600"
                  >
                    <CloseIcon size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>

      <FieldError message={uploadError ?? error} />
    </div>
  );
}
