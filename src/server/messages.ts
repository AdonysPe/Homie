import 'server-only';

import { and, asc, count, desc, eq, or, sql } from 'drizzle-orm';

import type { HomeType, RequestStatus } from '@/features/adoption/lib/adoption-options';
import { getDb, schema } from './db';

const { adoptionRequests, messages, pets } = schema;

export type RequestRole = 'owner' | 'adopter';

/**
 * Privacidad asimétrica: el adoptante se presenta con su nombre real;
 * la familia que da en adopción se muestra como "Familia de …" y su
 * email o teléfono nunca se consultan acá.
 */
export const ownerDisplayName = (petName: string) => `Familia de ${petName}`;

export async function findRequestId(petId: string, adopterId: string): Promise<string | null> {
  const db = await getDb();
  const [row] = await db
    .select({ id: adoptionRequests.id })
    .from(adoptionRequests)
    .where(and(eq(adoptionRequests.petId, petId), eq(adoptionRequests.adopterId, adopterId)))
    .limit(1);
  return row?.id ?? null;
}

/** Mensajes sin leer + cartas nuevas sin abrir (para el badge del header). */
export async function countUnread(userId: string): Promise<number> {
  const db = await getDb();
  const [[unreadMessages], [unopenedRequests]] = await Promise.all([
    db
      .select({ value: count() })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false))),
    db
      .select({ value: count() })
      .from(adoptionRequests)
      .where(and(eq(adoptionRequests.ownerId, userId), eq(adoptionRequests.isReadByOwner, false))),
  ]);
  return (unreadMessages?.value ?? 0) + (unopenedRequests?.value ?? 0);
}

export interface InboxRequest {
  id: string;
  role: RequestRole;
  /** Nombre visible de la otra parte. */
  counterpart: string;
  adopterCity: string;
  homeType: HomeType;
  status: RequestStatus;
  /** Último mensaje del chat, o la carta si todavía no hay chat. */
  preview: string;
  previewIsMine: boolean;
  lastActivityAt: string;
  unread: boolean;
}

export interface InboxGroup {
  pet: { id: string; slug: string; name: string; photoUrl: string | null; photoAlt: string };
  role: RequestRole;
  requests: InboxRequest[];
  unreadCount: number;
}

/**
 * Bandeja agrupada por mascota: primero las solicitudes recibidas por mis
 * mascotas, después mis propias postulaciones.
 */
export async function listInbox(userId: string): Promise<InboxGroup[]> {
  const db = await getDb();
  const lastMessage = (column: typeof messages.content | typeof messages.senderId) =>
    sql<string | null>`(select ${column} from ${messages} where ${messages.requestId} = ${adoptionRequests.id} order by ${messages.createdAt} desc limit 1)`;

  const rows = await db
    .select({
      id: adoptionRequests.id,
      ownerId: adoptionRequests.ownerId,
      adopterId: adoptionRequests.adopterId,
      adopterName: adoptionRequests.adopterName,
      adopterCity: adoptionRequests.adopterCity,
      homeType: adoptionRequests.homeType,
      message: adoptionRequests.message,
      status: adoptionRequests.status,
      isReadByOwner: adoptionRequests.isReadByOwner,
      lastActivityAt: adoptionRequests.lastActivityAt,
      petId: pets.id,
      petSlug: pets.slug,
      petName: pets.name,
      petPhotos: pets.photos,
      lastMessage: lastMessage(messages.content),
      lastSenderId: lastMessage(messages.senderId),
      unreadMessages: sql<number>`(select count(*)::int from ${messages} where ${messages.requestId} = ${adoptionRequests.id} and ${messages.receiverId} = ${userId} and ${messages.isRead} = false)`,
    })
    .from(adoptionRequests)
    .innerJoin(pets, eq(pets.id, adoptionRequests.petId))
    .where(or(eq(adoptionRequests.ownerId, userId), eq(adoptionRequests.adopterId, userId)))
    .orderBy(desc(adoptionRequests.lastActivityAt));

  const groups = new Map<string, InboxGroup>();

  for (const row of rows) {
    const role: RequestRole = row.ownerId === userId ? 'owner' : 'adopter';
    const key = `${role}:${row.petId}`;
    const [photo] = row.petPhotos;
    const unread = row.unreadMessages > 0 || (role === 'owner' && !row.isReadByOwner);

    let group = groups.get(key);
    if (!group) {
      group = {
        pet: {
          id: row.petId,
          slug: row.petSlug,
          name: row.petName,
          photoUrl: photo?.url ?? null,
          photoAlt: photo?.alt ?? row.petName,
        },
        role,
        requests: [],
        unreadCount: 0,
      };
      groups.set(key, group);
    }

    if (unread) group.unreadCount += 1;
    group.requests.push({
      id: row.id,
      role,
      counterpart: role === 'owner' ? row.adopterName : ownerDisplayName(row.petName),
      adopterCity: row.adopterCity,
      homeType: row.homeType,
      status: row.status,
      preview: row.lastMessage ?? row.message,
      previewIsMine: row.lastMessage ? row.lastSenderId === userId : role === 'adopter',
      lastActivityAt: row.lastActivityAt.toISOString(),
      unread,
    });
  }

  const all = [...groups.values()];
  return [...all.filter((group) => group.role === 'owner'), ...all.filter((group) => group.role === 'adopter')];
}

export interface ThreadMessage {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

export interface Thread {
  id: string;
  role: RequestRole;
  counterpart: string;
  pet: { slug: string; name: string; photoUrl: string | null; photoAlt: string };
  /** La carta de presentación, siempre visible arriba del chat. */
  request: {
    adopterId: string;
    adopterName: string;
    adopterCity: string;
    homeType: HomeType;
    message: string;
    status: RequestStatus;
    createdAt: string;
  };
  contactSharedAt: string | null;
  /** Solo para quien adopta, y solo después de que la familia decidió compartirlo. */
  sharedContact: {
    ownerName: string;
    method: 'whatsapp' | 'email';
    value: string;
    microchipNumber: string | null;
  } | null;
  messages: ThreadMessage[];
  /** Hay algo sin leer para quien mira (mensajes o la carta nueva). */
  hasUnread: boolean;
}

/** Devuelve el hilo solo si `userId` participa (si no, `null`: se trata como inexistente). */
export async function getThread(requestId: string, userId: string): Promise<Thread | null> {
  const db = await getDb();
  const [request] = await db
    .select({
      id: adoptionRequests.id,
      ownerId: adoptionRequests.ownerId,
      adopterId: adoptionRequests.adopterId,
      adopterName: adoptionRequests.adopterName,
      adopterCity: adoptionRequests.adopterCity,
      homeType: adoptionRequests.homeType,
      message: adoptionRequests.message,
      status: adoptionRequests.status,
      isReadByOwner: adoptionRequests.isReadByOwner,
      contactSharedAt: adoptionRequests.contactSharedAt,
      createdAt: adoptionRequests.createdAt,
      petSlug: pets.slug,
      petName: pets.name,
      petPhotos: pets.photos,
      ownerName: pets.ownerName,
      contactMethod: pets.contactMethod,
      contactValue: pets.contactValue,
      microchipNumber: pets.microchipNumber,
    })
    .from(adoptionRequests)
    .innerJoin(pets, eq(pets.id, adoptionRequests.petId))
    .where(
      and(
        eq(adoptionRequests.id, requestId),
        or(eq(adoptionRequests.ownerId, userId), eq(adoptionRequests.adopterId, userId)),
      ),
    )
    .limit(1);

  if (!request) return null;

  const role: RequestRole = request.ownerId === userId ? 'owner' : 'adopter';
  const rows = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      isUnreadForMe: sql<boolean>`${messages.receiverId} = ${userId} and ${messages.isRead} = false`,
    })
    .from(messages)
    .where(eq(messages.requestId, requestId))
    .orderBy(asc(messages.createdAt));

  const [photo] = request.petPhotos;
  const canSeeContact = role === 'adopter' && request.contactSharedAt !== null;

  return {
    id: request.id,
    role,
    counterpart: role === 'owner' ? request.adopterName : ownerDisplayName(request.petName),
    pet: {
      slug: request.petSlug,
      name: request.petName,
      photoUrl: photo?.url ?? null,
      photoAlt: photo?.alt ?? request.petName,
    },
    request: {
      adopterId: request.adopterId,
      adopterName: request.adopterName,
      adopterCity: request.adopterCity,
      homeType: request.homeType,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    },
    contactSharedAt: request.contactSharedAt?.toISOString() ?? null,
    sharedContact: canSeeContact
      ? {
          ownerName: request.ownerName,
          method: request.contactMethod,
          value: request.contactValue,
          microchipNumber: request.microchipNumber,
        }
      : null,
    messages: rows.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      isMine: row.senderId === userId,
    })),
    hasUnread: rows.some((row) => row.isUnreadForMe) || (role === 'owner' && !request.isReadByOwner),
  };
}
