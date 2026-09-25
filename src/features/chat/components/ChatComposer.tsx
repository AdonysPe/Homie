'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type KeyboardEvent } from 'react';

import { CloseIcon, ImageIcon, SendIcon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { MESSAGE_MAX } from '@/features/messaging/lib/message-schema';
import { resizeImage } from '@/lib/resize-image';
import type { OutgoingDraft } from '../lib/chat-state';
import { TYPING_THROTTLE_MS } from '../lib/chat-types';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

interface ChatComposerProps {
  onSend: (draft: OutgoingDraft) => void;
  onTyping: () => void;
  status?: string | null;
}

export function ChatComposer({ onSend, onTyping, status }: ChatComposerProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<OutgoingDraft['image']>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingRef = useRef(0);

  const trimmed = content.trim();
  const canSend = (trimmed.length > 0 || image !== null) && !isPreparingImage;

  const notifyTyping = (value: string) => {
    if (!value.trim()) return;
    const now = Date.now();
    if (now - lastTypingRef.current < TYPING_THROTTLE_MS) return;
    lastTypingRef.current = now;
    onTyping();
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo puedes enviar fotos.');
      return;
    }
    setIsPreparingImage(true);
    try {
      // Se comprime y se le quita el EXIF (ubicación incluida) antes de salir del teléfono.
      const resized = await resizeImage(file, 1600);
      if (image) URL.revokeObjectURL(image.previewUrl);
      setImage({ ...resized, previewUrl: URL.createObjectURL(resized.blob) });
      textareaRef.current?.focus();
    } catch {
      toast.error('No pudimos procesar esa foto. Prueba con otra (JPG o PNG).');
    } finally {
      setIsPreparingImage(false);
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  };

  const send = () => {
    if (!canSend) return;
    // La URL de vista previa pasa al mensaje: la libera el chat cuando ya no se usa.
    onSend({ content: trimmed, image });
    setContent('');
    setImage(null);
    lastTypingRef.current = 0;
    textareaRef.current?.focus();
  };

  // Escritorio: Enter envía y Mayús+Enter salta de línea. Táctil: Enter salta de línea.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if ((!isTouch && !event.shiftKey) || event.metaKey || event.ctrlKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className="sticky bottom-0 -mx-1 flex flex-col gap-2 rounded-t-[1.5rem] bg-cream-100/90 px-1 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
    >
      {status ? <p className="px-2 text-center text-xs text-ink-400">{status}</p> : null}

      <AnimatePresence>
        {image ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-1"
          >
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt="Foto lista para enviar"
                className="h-24 w-auto max-w-[12rem] rounded-card object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Quitar la foto"
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-white shadow-soft"
              >
                <CloseIcon size={14} strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            void pickImage(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPreparingImage}
          aria-label="Adjuntar una foto"
          className="flex h-[2.875rem] w-[2.875rem] shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200 hover:text-clay-600 disabled:opacity-50"
        >
          {isPreparingImage ? <Spinner size={18} /> : <ImageIcon size={22} />}
        </button>

        <label htmlFor="chat-reply" className="sr-only">
          Escribe tu mensaje
        </label>
        <textarea
          ref={textareaRef}
          id="chat-reply"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            notifyTyping(event.target.value);
          }}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={MESSAGE_MAX}
          placeholder={image ? 'Agrega un comentario (opcional)' : 'Escribe un mensaje'}
          className="max-h-40 min-h-[2.875rem] flex-1 resize-none rounded-[1.4rem] border border-cream-400 bg-white px-4 py-3 text-[0.95rem] leading-snug [field-sizing:content] placeholder:text-ink-300"
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar"
          className="flex h-[2.875rem] w-[2.875rem] shrink-0 items-center justify-center rounded-full bg-clay-500 text-white transition-all hover:bg-clay-600 disabled:bg-cream-400"
        >
          <SendIcon size={20} strokeWidth={2.2} />
        </button>
      </div>
    </form>
  );
}
