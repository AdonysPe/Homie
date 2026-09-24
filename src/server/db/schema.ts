import {
  boolean,
  customType,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import type {
  IdealHome,
  PetPhotoRef,
  PetSex,
  PetSize,
  PetSpecies,
  PetStatus,
  RehomingReason,
} from '@/types/pet';
import type { ReportReason, ReportStatus } from '@/features/reports/lib/report-reasons';

/* ------------------------------------------------------------------
 * Tablas de Better Auth (user, session, account, verification).
 * Los nombres de campo siguen el contrato del adaptador de Drizzle.
 * ------------------------------------------------------------------ */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('account_user_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

/* ------------------------------------------------------------------
 * Dominio de Homie.
 * Regla de oro: todo lo marcado como PRIVADO nunca sale en una
 * consulta pública (ver `src/server/pets.ts`).
 * ------------------------------------------------------------------ */

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'bytea',
});

export const pets = pgTable(
  'pets',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    species: text('species').$type<PetSpecies>().notNull(),
    sex: text('sex').$type<PetSex>().notNull(),
    ageLabel: text('age_label').notNull(),
    size: text('size').$type<PetSize>(),
    city: text('city').notNull(),

    photos: jsonb('photos').$type<PetPhotoRef[]>().notNull().default([]),
    highlight: text('highlight').notNull(),
    description: text('description'),

    sterilized: boolean('sterilized').notNull().default(false),
    vaccinated: boolean('vaccinated').notNull().default(false),
    dewormed: boolean('dewormed').notNull().default(false),
    hasMicrochip: boolean('has_microchip').notNull().default(false),
    specialNeeds: text('special_needs'),
    idealHome: text('ideal_home').$type<IdealHome>().notNull(),
    goodWithKids: boolean('good_with_kids').notNull().default(false),
    goodWithPets: boolean('good_with_pets').notNull().default(false),

    /** PRIVADO: solo lo recibe la familia adoptante. */
    microchipNumber: text('microchip_number'),
    /** PRIVADO: solo para mejorar el servicio. */
    reason: text('reason').$type<RehomingReason>().notNull(),
    /** PRIVADO: se revela solo cuando la familia lo decide en una conversación. */
    ownerName: text('owner_name').notNull(),
    contactMethod: text('contact_method').$type<'whatsapp' | 'email'>().notNull(),
    contactValue: text('contact_value').notNull(),

    status: text('status').$type<PetStatus>().notNull().default('publicada'),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('pets_owner_idx').on(table.ownerId),
    index('pets_status_published_idx').on(table.status, table.publishedAt),
  ],
);

/** Fotos subidas por las familias (ya redimensionadas en el navegador). */
export const petPhotos = pgTable(
  'pet_photos',
  {
    id: text('id').primaryKey(),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    mimeType: text('mime_type').notNull(),
    data: bytea('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('pet_photos_pet_idx').on(table.petId)],
);

/**
 * Un hilo por mascota e interesado. Guarda el alias que eligió quien adopta
 * y si la familia ya decidió compartir su contacto.
 */
export const conversations = pgTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    adopterId: text('adopter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Nombre que el interesado eligió mostrar. Nunca su email. */
    adopterAlias: text('adopter_alias').notNull(),
    contactSharedAt: timestamp('contact_shared_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('conversations_pet_adopter_idx').on(table.petId, table.adopterId),
    index('conversations_owner_idx').on(table.ownerId),
    index('conversations_adopter_idx').on(table.adopterId),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('messages_conversation_idx').on(table.conversationId, table.createdAt),
    index('messages_receiver_unread_idx').on(table.receiverId, table.isRead),
    index('messages_sender_created_idx').on(table.senderId, table.createdAt),
  ],
);

export const reports = pgTable(
  'reports',
  {
    id: text('id').primaryKey(),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    /** Opcional: se permite reportar sin cuenta. */
    reporterId: text('reporter_id').references(() => user.id, { onDelete: 'set null' }),
    reason: text('reason').$type<ReportReason>().notNull(),
    details: text('details'),
    status: text('status').$type<ReportStatus>().notNull().default('pendiente'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => [
    index('reports_pet_status_idx').on(table.petId, table.status),
    // Una persona con cuenta reporta una vez por mascota (los anónimos tienen reporterId NULL).
    uniqueIndex('reports_pet_reporter_idx').on(table.petId, table.reporterId),
  ],
);
