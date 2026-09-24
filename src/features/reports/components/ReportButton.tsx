'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { FlagIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { reportPet } from '@/server/actions/reports';
import { REPORT_DETAILS_MAX, REPORT_REASON_OPTIONS } from '../lib/report-reasons';
import { reportSchema, type ReportInput } from '../lib/report-schema';

interface ReportButtonProps {
  petId: string;
  petName: string;
  /**
   * `overlay`: ícono flotante sobre la foto de una tarjeta.
   * `inline`: enlace discreto de texto (ficha de la mascota).
   */
  variant?: 'overlay' | 'inline';
  className?: string;
}

/** Botón discreto de reporte + formulario en Sheet. No exige cuenta. */
export function ReportButton({ petId, petName, variant = 'inline', className }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // En las tarjetas, el botón vive sobre el enlace a la ficha: que no navegue.
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={variant === 'overlay' ? `Reportar la publicación de ${petName}` : undefined}
        className={cn(
          variant === 'overlay'
            ? 'flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-ink-500 opacity-80 backdrop-blur-sm transition-all hover:bg-white hover:text-clay-600 hover:opacity-100 focus-visible:opacity-100'
            : 'inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-clay-600',
          className,
        )}
      >
        <FlagIcon size={variant === 'overlay' ? 15 : 16} />
        {variant === 'inline' ? 'Reportar publicación' : null}
      </button>

      <Sheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Reportar publicación"
        description={`Nos ayuda a cuidar a ${petName} y a la comunidad. El reporte es confidencial: la familia no sabe quién lo hizo.`}
      >
        {isOpen ? <ReportForm petId={petId} onDone={() => setIsOpen(false)} /> : null}
      </Sheet>
    </>
  );
}

function ReportForm({ petId, onDone }: { petId: string; onDone: () => void }) {
  const router = useRouter();
  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { petId, reason: 'adoptado', details: '' },
  });
  const { register, formState, control } = form;
  const detailsLength = useWatch({ control, name: 'details' })?.length ?? 0;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await reportPet(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Gracias. Vamos a revisar la publicación.');
    onDone();
    if (result.data.underReview) router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Select
        label="Motivo"
        options={REPORT_REASON_OPTIONS}
        error={formState.errors.reason?.message}
        {...register('reason')}
      />
      <TextArea
        label="Detalles (opcional)"
        placeholder="Contanos qué viste. Cuanta más información, más rápido podemos actuar."
        rows={4}
        maxLength={REPORT_DETAILS_MAX}
        currentLength={detailsLength}
        error={formState.errors.details?.message}
        {...register('details')}
      />
      <Button type="submit" size="lg" fullWidth isLoading={formState.isSubmitting}>
        {formState.isSubmitting ? 'Enviando…' : 'Enviar reporte'}
      </Button>
      <p className="-mt-2 text-center text-xs text-ink-400">
        Si ves maltrato animal en curso, además de reportar, llamá a la línea local de denuncias.
      </p>
    </form>
  );
}
