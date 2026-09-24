'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Ids abiertos al montar. */
  defaultOpen?: string[];
  /** `single`: abrir uno cierra el resto (como en iOS). */
  type?: 'single' | 'multiple';
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/**
 * Acordeón según el patrón WAI-ARIA APG:
 * - cada encabezado es un <button> dentro de un heading real, con `aria-expanded` y `aria-controls`;
 * - el panel es un `region` etiquetado por su botón y existe siempre en el DOM
 *   (así `aria-controls` nunca apunta a la nada);
 * - ↑/↓ recorren los encabezados, Inicio/Fin saltan al primero/último,
 *   Enter y Espacio los abren (comportamiento nativo del botón).
 *
 * La animación usa `grid-template-rows` 0fr → 1fr: altura automática sin medir con JS.
 * Cerrado, el panel queda en `visibility: hidden`, que lo saca del orden de tabulación
 * y del árbol de accesibilidad.
 */
export function Accordion({
  items,
  defaultOpen = [],
  type = 'single',
  headingLevel: Heading = 'h3',
  className,
}: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (isOpen) return current.filter((openId) => openId !== id);
      return type === 'single' ? [id] : [...current, id];
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const targetIndex = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (targetIndex === undefined) return;
    event.preventDefault();
    buttonRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div
            key={item.id}
            className={cn(
              'overflow-hidden rounded-card border bg-white transition-[border-color,box-shadow] duration-300 ease-soft',
              isOpen ? 'border-clay-200 shadow-soft' : 'border-cream-300 hover:border-cream-400',
            )}
          >
            <Heading className="m-0">
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:ring-inset focus-visible:ring-offset-0"
              >
                <span className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                  {item.title}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-soft',
                    isOpen ? 'rotate-180 bg-clay-100 text-clay-600' : 'bg-cream-200 text-ink-400',
                  )}
                >
                  <ChevronDownIcon size={16} strokeWidth={2} />
                </span>
              </button>
            </Heading>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-[grid-template-rows,visibility] duration-300 ease-soft',
                isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink-500">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
