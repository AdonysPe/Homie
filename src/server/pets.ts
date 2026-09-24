import 'server-only';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { cache } from 'react';

import type { ListingStatus, PetListing, PetStatus } from '@/types/pet';
import { getDb, schema, type Database } from './db';

const { pets, user, adoptionRequests, messages } = schema;

/**
 * Columnas PÚBLICAS de una mascota. Es la única proyección que se usa para
 * construir lo que ve cualquier visitante: los campos privados (contacto,
 * microchip, motivo, nombre de la familia) no están acá a propósito.
 */
const publicColumns = {
  id: pets.id,
  slug: pets.slug,
  ownerId: pets.ownerId,
  name: pets.name,
  species: pets.species,
  sex: pets.sex,
  ageLabel: pets.ageLabel,
  size: pets.size,
  city: pets.city,
  photos: pets.photos,
  highlight: pets.highlight,
  description: pets.description,
  sterilized: pets.sterilized,
  vaccinated: pets.vaccinated,
  dewormed: pets.dewormed,
  hasMicrochip: pets.hasMicrochip,
  specialNeeds: pets.specialNeeds,
  idealHome: pets.idealHome,
  goodWithKids: pets.goodWithKids,
  goodWithPets: pets.goodWithPets,
  status: pets.status,
  publishedAt: pets.publishedAt,
  ownerVerified: user.emailVerified,
  interestedCount: sql<number>`(select count(*)::int from ${adoptionRequests} where ${adoptionRequests.petId} = ${pets.id})`,
};

const selectPublicPets = (db: Database) =>
  db.select(publicColumns).from(pets).innerJoin(user, eq(user.id, pets.ownerId));

type PublicPetRow = Awaited<ReturnType<typeof selectPublicPets>>[number];

/** Lo que se muestra: una publicación activa con consultas se ve "Con interesados". */
export function displayStatus(status: PetStatus, interestedCount: number): ListingStatus {
  return status === 'publicada' && interestedCount > 0 ? 'con-interesados' : status;
}

function toListing(row: PublicPetRow): PetListing {
  const [mainPhoto, ...gallery] = row.photos;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    species: row.species,
    sex: row.sex,
    ageLabel: row.ageLabel,
    size: row.size ?? undefined,
    city: row.city,
    photoUrl: mainPhoto?.url ?? null,
    photoAlt: mainPhoto?.alt ?? `${row.name}, sin foto`,
    gallery,
    highlight: row.highlight,
    description: row.description ?? undefined,
    health: {
      sterilized: row.sterilized,
      vaccinated: row.vaccinated,
      dewormed: row.dewormed,
      microchip: row.hasMicrochip,
    },
    specialNeeds: row.specialNeeds ?? undefined,
    idealHome: row.idealHome,
    goodWithKids: row.goodWithKids,
    goodWithPets: row.goodWithPets,
    status: displayStatus(row.status, row.interestedCount),
    interestedCount: row.interestedCount,
    publishedAt: row.publishedAt.toISOString(),
    ownerVerified: row.ownerVerified,
  };
}

const PUBLIC_STATUSES: PetStatus[] = ['publicada', 'adoptada'];

/** Galería pública: solo activas y adoptadas (las pausadas o en revisión no se listan). */
export async function listPublicPets(): Promise<PetListing[]> {
  const db = await getDb();
  const rows = await selectPublicPets(db)
    .where(inArray(pets.status, PUBLIC_STATUSES))
    .orderBy(desc(pets.publishedAt))
    .limit(48);
  return rows.map(toListing);
}

export interface PetPageData {
  listing: PetListing;
  ownerId: string;
  status: PetStatus;
}

/** Memoizada por request: la usan tanto `generateMetadata` como la página. */
export const getPetBySlug = cache(async (slug: string): Promise<PetPageData | null> => {
  const db = await getDb();
  const [row] = await selectPublicPets(db)
    .where(eq(pets.slug, slug))
    .limit(1);
  if (!row) return null;
  return { listing: toListing(row), ownerId: row.ownerId, status: row.status };
});

export interface OwnerPet {
  listing: PetListing;
  status: PetStatus;
  conversationCount: number;
  unreadCount: number;
  pendingReports: number;
}

/** "Mis publicaciones": incluye todos los estados, con contadores para el panel. */
export async function listOwnerPets(ownerId: string): Promise<OwnerPet[]> {
  const db = await getDb();
  const rows = await db
    .select({
      ...publicColumns,
      // Solicitudes sin abrir + mensajes sin leer, de esta mascota.
      unreadCount: sql<number>`(select count(*)::int from ${adoptionRequests} where ${adoptionRequests.petId} = ${pets.id} and ${adoptionRequests.isReadByOwner} = false)
        + (select count(*)::int from ${messages} inner join ${adoptionRequests} on ${adoptionRequests.id} = ${messages.requestId} where ${adoptionRequests.petId} = ${pets.id} and ${messages.receiverId} = ${ownerId} and ${messages.isRead} = false)`,
      pendingReports: sql<number>`(select count(*)::int from ${schema.reports} where ${schema.reports.petId} = ${pets.id} and ${schema.reports.status} = 'pendiente')`,
    })
    .from(pets)
    .innerJoin(user, eq(user.id, pets.ownerId))
    .where(eq(pets.ownerId, ownerId))
    .orderBy(desc(pets.publishedAt));

  return rows.map((row) => ({
    listing: toListing(row),
    status: row.status,
    conversationCount: row.interestedCount,
    unreadCount: row.unreadCount,
    pendingReports: row.pendingReports,
  }));
}

/** Devuelve la mascota solo si pertenece a `ownerId` (autorización a nivel de fila). */
export async function findOwnedPet(petId: string, ownerId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ id: pets.id, slug: pets.slug, name: pets.name, status: pets.status })
    .from(pets)
    .where(and(eq(pets.id, petId), eq(pets.ownerId, ownerId)))
    .limit(1);
  return row ?? null;
}
