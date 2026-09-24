'use client';

import type { ReactNode } from 'react';

import { CheckIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/**
 * Lista agrupada al estilo de los Ajustes de iOS: un solo contenedor,
 * filas separadas por una línea fina y el check alineado a la derecha.
 * Cada fila es un checkbox nativo, así que Tab y Espacio funcionan solos.
 */
export function CheckList({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-ink-700">{legend}</legend>
      <div className="divide-y divide-cream-300 overflow-hidden rounded-card border border-cream-400 bg-white">
        {children}
      </div>
    </fieldset>
  );
}

export function CheckListItem({
  label,
  hint,
  icon,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors duration-150',
        'focus-within:bg-clay-50/60 hover:bg-cream-50',
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] transition-colors duration-200',
            checked ? 'bg-sage-100 text-sage-700' : 'bg-cream-200 text-ink-400',
          )}
        >
          {icon}
        </span>
      ) : null}

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[0.95rem] font-medium text-ink-900">{label}</span>
        {hint ? <span className="text-xs text-ink-400">{hint}</span> : null}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-soft',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-clay-500 peer-focus-visible:ring-offset-2',
          checked ? 'border-sage-500 bg-sage-500 text-white' : 'border-cream-400 bg-white text-transparent',
        )}
      >
        <CheckIcon size={14} strokeWidth={2.4} />
      </span>
    </label>
  );
}
