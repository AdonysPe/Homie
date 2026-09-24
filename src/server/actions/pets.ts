'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import type { PetStatus } from '@/types/pet';
import { getDb, schema } from '../db';
import { findOwnedPet } from '../pets';
import { requireVerifiedUser } from '../session';

export type PetStatusAction = 'pausar' | 'reanudar' | 'adoptada';

/** Transiciones permitidas desde el panel. "En revisión" solo la levanta el equipo. */
const TRANSITIONS: Record<PetStatusAction, { from: PetStatus[]; to: PetStatus }> = {
  pausar: { from: ['publicada'], to: 'pausada' },
  reanudar: { from: ['pausada'], to: 'publicada' },
  adoptada: { from: ['publicada', 'pausada', 'en-revision'], to: 'adoptada' },
};

const SUCCESS_MESSAGES: Record<PetStatusAction, string> = {
  pausar: 'Publicación pausada. Nadie nuevo puede escribirte.',
  reanudar: 'Publicación activa otra vez.',
  adoptada: '¡Qué alegría! Marcamos la publicación como adoptada.',
};

export async function updatePetStatus(
  petId: string,
  action: PetStatusAction,
): Promise<ActionResult<{ status: PetStatus; message: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const transition = TRANSITIONS[action];
  if (!transition) return actionError('Acción inválida.', 'invalid');

  const pet = await findOwnedPet(petId, auth.user.id);
  if (!pet) return actionError('No encontramos esta publicación.', 'forbidden');

  if (!transition.from.includes(pet.status)) {
    return actionError(
      pet.status === 'en-revision'
        ? 'Estamos revisando esta publicación. Te avisamos apenas termine.'
        : 'Esta publicación no se puede cambiar a ese estado.',
      'invalid',
    );
  }

  const db = await getDb();
  await db
    .update(schema.pets)
    .set({ status: transition.to, updatedAt: new Date() })
    .where(and(eq(schema.pets.id, pet.id), eq(schema.pets.status, pet.status)));

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/mascota/${pet.slug}`);
  return actionOk({ status: transition.to, message: SUCCESS_MESSAGES[action] });
}
