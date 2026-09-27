'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { CheckIcon, HomeHeartIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { confirmAdoptionCompleted } from '@/server/actions/adoption';
import type { Thread } from '@/server/messages';

/**
 * Confirmación cruzada de que la adopción se concretó: hacen falta las dos
 * partes para pasar a `completada` y recién ahí habilitar las reseñas.
 */
export function CompletionCard({ thread }: { thread: Thread }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { myConfirmedAt, counterpartConfirmedAt } = thread.completion;

  if (thread.request.status === 'completada') {
    return (
      <p className="flex items-start gap-2 rounded-card bg-sage-50 p-3.5 text-sm text-sage-800">
        <HomeHeartIcon size={18} className="mt-px shrink-0 text-sage-600" />
        Confirmaron juntos que la adopción de {thread.pet.name} se completó. Ya pueden dejarse una reseña.
      </p>
    );
  }

  if (thread.request.status !== 'aceptada') return null;

  const confirm = () =>
    startTransition(async () => {
      const result = await confirmAdoptionCompleted(thread.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data.completed ? '¡Adopción completada!' : 'Confirmaste tu parte');
      router.refresh();
    });

  if (myConfirmedAt) {
    return (
      <p className="flex items-start gap-2 rounded-card bg-cream-200/70 p-3.5 text-sm text-ink-500">
        <CheckIcon size={17} className="mt-px shrink-0 text-sage-600" />
        Confirmaste que la adopción se completó. Falta que {thread.counterpart} también lo confirme.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-panel border border-cream-300 bg-cream-50 p-4 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm text-ink-600">
        {counterpartConfirmedAt
          ? `${thread.counterpart} ya confirmó que ${thread.pet.name} tiene un nuevo hogar. ¿Confirmas tú también?`
          : `¿${thread.pet.name} ya se fue con ${thread.counterpart}?`}
      </p>
      <Button variant="quiet" size="sm" onClick={confirm} isLoading={isPending}>
        <HomeHeartIcon size={16} />
        Confirmar adopción completada
      </Button>
    </div>
  );
}
