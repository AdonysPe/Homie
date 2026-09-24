'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { HomeHeartIcon, PauseIcon, PlayIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { toast } from '@/components/ui/Toast';
import { updatePetStatus, type PetStatusAction } from '@/server/actions/pets';
import type { PetStatus } from '@/types/pet';

/** Botones "Pausar / Reanudar" y "Marcar como adoptada" de una publicación propia. */
export function PetStatusActions({ petId, petName, status }: { petId: string; petName: string; status: PetStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PetStatusAction | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const run = (action: PetStatusAction) => {
    setPendingAction(action);
    startTransition(async () => {
      const result = await updatePetStatus(petId, action);
      setPendingAction(null);
      setIsConfirmOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data.message);
      router.refresh();
    });
  };

  if (status === 'adoptada') return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'publicada' ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => run('pausar')}
          isLoading={pendingAction === 'pausar'}
          disabled={isPending}
        >
          {pendingAction !== 'pausar' ? <PauseIcon size={16} /> : null}
          Pausar
        </Button>
      ) : null}
      {status === 'pausada' ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => run('reanudar')}
          isLoading={pendingAction === 'reanudar'}
          disabled={isPending}
        >
          {pendingAction !== 'reanudar' ? <PlayIcon size={16} /> : null}
          Reanudar
        </Button>
      ) : null}
      <Button variant="quiet" size="sm" onClick={() => setIsConfirmOpen(true)} disabled={isPending}>
        <HomeHeartIcon size={16} />
        Marcar como adoptada
      </Button>

      <Sheet
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`¿${petName} ya tiene hogar?`}
        description="La publicación deja de recibir mensajes nuevos y se muestra como adoptada. Las conversaciones siguen disponibles."
      >
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" fullWidth onClick={() => run('adoptada')} isLoading={pendingAction === 'adoptada'}>
            Sí, ya fue adoptada
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={() => setIsConfirmOpen(false)} disabled={isPending}>
            Todavía no
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
