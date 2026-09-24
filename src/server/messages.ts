import 'server-only';

import { and, asc, desc, eq, or, sql } from 'drizzle-orm';

import { getDb, schema } from './db';

const { conversations, messages, pets } = schema;

export type ConversationRole = 'owner' | 'adopter';

/**
 * Cómo se ve cada parte. Es la ÚNICA fuente de nombres en la mensajería:
 * nunca se consulta `user.email` ni `user.name` del otro participante.
 */
export const displayName = {
  adopter: (alias: string) => alias || 'Usuario Homie',
  owner: (petName: string) => `Familia de ${petName}`,
};

export async function findConversationId(petId: string, adopterId: string): Promise<string | null> {
  const db = await getDb();
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.petId, petId), eq(conversations.adopterId, adopterId)))
    .limit(1);
  return row?.id ?? null;
}

export interface InboxConversation {
  id: string;
  role: ConversationRole;
  /** Nombre visible de la otra parte (alias o "Familia de …"). */
  counterpart: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageIsMine: boolean;
  unreadCount: number;
  contactShared: boolean;
}

export interface InboxGroup {
  pet: { id: string; slug: string; name: string; photoUrl: string | null; photoAlt: string };
  role: ConversationRole;
  conversations: InboxConversation[];
  unreadCount: number;
}

/**
 * Bandeja agrupada por mascota. Primero las mascotas propias (mensajes recibidos),
 * después las consultas que el usuario hizo a otras familias.
 */
export async function listInbox(userId: string): Promise<InboxGroup[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: conversations.id,
      ownerId: conversations.ownerId,
      adopterAlias: conversations.adopterAlias,
      contactSharedAt: conversations.contactSharedAt,
      lastMessageAt: conversations.lastMessageAt,
      petId: pets.id,
      petSlug: pets.slug,
      petName: pets.name,
      petPhotos: pets.photos,
      lastMessage: sql<string>`(select ${messages.content} from ${messages} where ${messages.conversationId} = ${conversations.id} order by ${messages.createdAt} desc limit 1)`,
      lastSenderId: sql<string>`(select ${messages.senderId} from ${messages} where ${messages.conversationId} = ${conversations.id} order by ${messages.createdAt} desc limit 1)`,
      unreadCount: sql<number>`(select count(*)::int from ${messages} where ${messages.conversationId} = ${conversations.id} and ${messages.receiverId} = ${userId} and ${messages.isRead} = false)`,
    })
    .from(conversations)
    .innerJoin(pets, eq(pets.id, conversations.petId))
    .where(or(eq(conversations.ownerId, userId), eq(conversations.adopterId, userId)))
    .orderBy(desc(conversations.lastMessageAt));

  const groups = new Map<string, InboxGroup>();

  for (const row of rows) {
    const role: ConversationRole = row.ownerId === userId ? 'owner' : 'adopter';
    const key = `${role}:${row.petId}`;
    const [photo] = row.petPhotos;

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
        conversations: [],
        unreadCount: 0,
      };
      groups.set(key, group);
    }

    group.unreadCount += row.unreadCount;
    group.conversations.push({
      id: row.id,
      role,
      counterpart: role === 'owner' ? displayName.adopter(row.adopterAlias) : displayName.owner(row.petName),
      lastMessage: row.lastMessage ?? '',
      lastMessageAt: row.lastMessageAt.toISOString(),
      lastMessageIsMine: row.lastSenderId === userId,
      unreadCount: row.unreadCount,
      contactShared: Boolean(row.contactSharedAt),
    });
  }

  const all = [...groups.values()];
  return [...all.filter((group) => group.role === 'owner'), ...all.filter((group) => group.role === 'adopter')];
}

export async function countUnread(userId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
  return row?.value ?? 0;
}

export interface ThreadMessage {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

export interface Thread {
  id: string;
  role: ConversationRole;
  counterpart: string;
  pet: { slug: string; name: string; photoUrl: string | null; photoAlt: string };
  contactSharedAt: string | null;
  /** Solo presente para quien adopta, y solo después de que la familia decidió compartirlo. */
  sharedContact: {
    ownerName: string;
    method: 'whatsapp' | 'email';
    value: string;
    microchipNumber: string | null;
  } | null;
  messages: ThreadMessage[];
  /** Hay mensajes recibidos sin leer (para marcarlos al abrir). */
  hasUnread: boolean;
}

/** Devuelve el hilo solo si `userId` participa (si no, `null`: se trata como inexistente). */
export async function getThread(conversationId: string, userId: string): Promise<Thread | null> {
  const db = await getDb();
  const [conversation] = await db
    .select({
      id: conversations.id,
      ownerId: conversations.ownerId,
      adopterId: conversations.adopterId,
      adopterAlias: conversations.adopterAlias,
      contactSharedAt: conversations.contactSharedAt,
      petSlug: pets.slug,
      petName: pets.name,
      petPhotos: pets.photos,
      ownerName: pets.ownerName,
      contactMethod: pets.contactMethod,
      contactValue: pets.contactValue,
      microchipNumber: pets.microchipNumber,
    })
    .from(conversations)
    .innerJoin(pets, eq(pets.id, conversations.petId))
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.ownerId, userId), eq(conversations.adopterId, userId)),
      ),
    )
    .limit(1);

  if (!conversation) return null;

  const role: ConversationRole = conversation.ownerId === userId ? 'owner' : 'adopter';
  const rows = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      isUnreadForMe: sql<boolean>`${messages.receiverId} = ${userId} and ${messages.isRead} = false`,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const [photo] = conversation.petPhotos;
  const canSeeContact = role === 'adopter' && conversation.contactSharedAt !== null;

  return {
    id: conversation.id,
    role,
    counterpart:
      role === 'owner'
        ? displayName.adopter(conversation.adopterAlias)
        : displayName.owner(conversation.petName),
    pet: {
      slug: conversation.petSlug,
      name: conversation.petName,
      photoUrl: photo?.url ?? null,
      photoAlt: photo?.alt ?? conversation.petName,
    },
    contactSharedAt: conversation.contactSharedAt?.toISOString() ?? null,
    sharedContact: canSeeContact
      ? {
          ownerName: conversation.ownerName,
          method: conversation.contactMethod,
          value: conversation.contactValue,
          microchipNumber: conversation.microchipNumber,
        }
      : null,
    messages: rows.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      isMine: row.senderId === userId,
    })),
    hasUnread: rows.some((row) => row.isUnreadForMe),
  };
}
