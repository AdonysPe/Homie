'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import { CloseIcon } from '@/components/icons';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/**
 * Hoja inferior en móvil, modal centrado en desktop.
 *
 * Usa `<dialog>` nativo con `showModal()`: el navegador se encarga de la trampa
 * de foco, de volver inerte el resto de la página y de cerrar con Esc.
 * Las transiciones viven en CSS (`.sheet` en globals.css, con @starting-style).
 */
export function Sheet({ open, onClose, title, description, children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // Un click sobre el fondo llega con el propio <dialog> como target.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="sheet"
    >
      <div className="flex max-h-[inherit] flex-col">
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-9 shrink-0 rounded-pill bg-cream-400 sm:hidden" />

        <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
          <div>
            <h2 id={titleId} className="text-xl font-semibold tracking-[-0.02em] text-ink-900">
              {title}
            </h2>
            {description ? (
              <div id={descriptionId} className="mt-1 text-sm leading-snug text-ink-500">
                {description}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-500 transition-colors hover:bg-cream-300 hover:text-ink-900"
          >
            <CloseIcon size={16} strokeWidth={2} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}
