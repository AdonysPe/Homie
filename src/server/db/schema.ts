import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
import type { HomeType, RequestStatus } from '@/features/adoption/lib/adoption-options';
import type { ModerationAction, UserRole } from '@/features/moderation/lib/moderation-types';
import type { NotificationType } from '@/features/notifications/lib/notification-types';
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
  /** PRIVADO y opcional: nunca se muestra; solo se usa si la persona decide compartirlo. */
  phone: text('phone'),
  /** `admin` da acceso a /admin. Se asigna a mano en la base, nunca desde la app. */
  role: text('role').$type<UserRole>().notNull().default('user'),
  /** Suspendido por moderación: no puede ingresar, publicar ni escribir. */
  suspendedAt: timestamp('suspended_at', { withTimezone: true }),
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
 * Carta de presentación de quien quiere adoptar.
 *
 * Privacidad asimétrica: el adoptante se presenta con datos reales (nombre,
 * ciudad, tipo de hogar) para generar confianza; el dador sigue protegido y
 * decide si responde, acepta o comparte su contacto.
 */
export const adoptionRequests = pgTable(
  'adoption_requests',
  {
    id: text('id').primaryKey(),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    /** Dueño de la mascota al momento de la solicitud (evita un join en cada bandeja). */
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    adopterId: text('adopter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    adopterName: text('adopter_name').notNull(),
    adopterCity: text('adopter_city').notNull(),
    homeType: text('home_type').$type<HomeType>().notNull(),
    message: text('message').notNull(),
    status: text('status').$type<RequestStatus>().notNull().default('pendiente'),
    /** Cuándo el dador decidió revelar su contacto en este hilo (null = nunca). */
    contactSharedAt: timestamp('contact_shared_at', { withTimezone: true }),
    /** La carta cuenta como no leída hasta que el dador abre la solicitud. */
    isReadByOwner: boolean('is_read_by_owner').notNull().default(false),
    /**
     * Última pulsación de cada parte en el chat. "Escribiendo…" se muestra si es
     * de hace menos de 5 s: vive en la base porque el servidor de SSE que lo lee
     * puede ser otra instancia que la que recibió la pulsación.
     */
    ownerTypingAt: timestamp('owner_typing_at', { withTimezone: true }),
    adopterTypingAt: timestamp('adopter_typing_at', { withTimezone: true }),
    /** Confirmación de cada parte de que la adopción se concretó. Con las dos, pasa a `completada`. */
    ownerConfirmedAt: timestamp('owner_confirmed_at', { withTimezone: true }),
    adopterConfirmedAt: timestamp('adopter_confirmed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Una postulación por persona y mascota.
    uniqueIndex('adoption_requests_pet_adopter_idx').on(table.petId, table.adopterId),
    index('adoption_requests_owner_idx').on(table.ownerId, table.lastActivityAt),
    index('adoption_requests_adopter_idx').on(table.adopterId, table.lastActivityAt),
  ],
);

/**
 * Fotos enviadas por el chat (la mascota, el hogar del adoptante…).
 *
 * PRIVADAS: a diferencia de las fotos de publicaciones, no se sirven desde una
 * URL pública de CDN. Solo las ven los dos participantes de la solicitud
 * (ver `src/app/api/chat/imagenes/[id]/route.ts`).
 */
export const chatImages = pgTable(
  'chat_images',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => adoptionRequests.id, { onDelete: 'cascade' }),
    uploaderId: text('uploader_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mimeType: text('mime_type').notNull(),
    data: bytea('data').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('chat_images_request_idx').on(table.requestId)],
);

/** Chat interno posterior a la solicitud. */
export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => adoptionRequests.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Puede quedar vacío si el mensaje es solo una foto. */
    content: text('content').notNull().default(''),
    imageId: text('image_id').references(() => chatImages.id, { onDelete: 'set null' }),
    isRead: boolean('is_read').notNull().default(false),
    /** Para el "Visto": cuándo lo abrió quien lo recibió. */
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('messages_request_idx').on(table.requestId, table.createdAt),
    index('messages_receiver_unread_idx').on(table.receiverId, table.isRead),
    index('messages_sender_created_idx').on(table.senderId, table.createdAt),
  ],
);

/** Prueba social: la mascota ya en su hogar nuevo, contada por su familia. */
export const successStories = pgTable(
  'success_stories',
  {
    id: text('id').primaryKey(),
    petId: text('pet_id')
      .notNull()
      .unique()
      .references(() => pets.id, { onDelete: 'cascade' }),
    /** Opcional: la adopción pudo cerrarse fuera de la plataforma. */
    adopterId: text('adopter_id').references(() => user.id, { onDelete: 'set null' }),
    photo: text('photo').notNull(),
    photoAlt: text('photo_alt').notNull(),
    testimonial: text('testimonial').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('success_stories_adopter_idx').on(table.adopterId)],
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

/* ------------------------------------------------------------------
 * Fase 4: notificaciones, reputación y moderación.
 * ------------------------------------------------------------------ */

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').$type<NotificationType>().notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    /** Ruta interna a la que lleva la notificación (ej. /dashboard/mensajes/…). */
    link: text('link').notNull(),
    /**
     * Agrupa avisos repetidos: diez mensajes seguidos en la misma solicitud
     * actualizan una sola notificación no leída en vez de crear diez.
     */
    groupKey: text('group_key'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_user_idx').on(table.userId, table.isRead, table.createdAt),
    index('notifications_group_idx').on(table.userId, table.groupKey),
  ],
);

/** Suscripciones de Web Push (una por navegador y dispositivo). */
export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('push_subscriptions_user_idx').on(table.userId)],
);

/**
 * Reseñas entre dador y adoptante. Solo se pueden dejar sobre una solicitud
 * `completada` (las dos partes confirmaron la adopción), una por persona.
 */
export const reviews = pgTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => adoptionRequests.id, { onDelete: 'cascade' }),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    reviewerId: text('reviewer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    revieweeId: text('reviewee_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('reviews_request_reviewer_idx').on(table.requestId, table.reviewerId),
    index('reviews_reviewee_idx').on(table.revieweeId, table.createdAt),
    // Mismo rango que RATING_MIN / RATING_MAX en features/reviews/lib/review-rules.ts.
    check('reviews_rating_range', sql`${table.rating} between 1 and 5`),
    check('reviews_not_self', sql`${table.reviewerId} <> ${table.revieweeId}`),
  ],
);

/** Bloqueos: si A bloquea a B, no pueden escribirse ni ver el perfil del otro. */
export const blocks = pgTable(
  'blocks',
  {
    blockerId: text('blocker_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    blockedId: text('blocked_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.blockerId, table.blockedId] }),
    index('blocks_blocked_idx').on(table.blockedId),
    check('blocks_not_self', sql`${table.blockerId} <> ${table.blockedId}`),
  ],
);

/**
 * Registro de auditoría de moderación. Alimenta las métricas del panel
 * (publicaciones eliminadas, usuarios suspendidos) y deja constancia de
 * quién hizo qué. Las referencias se conservan aunque se borre el objeto.
 */
export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: text('id').primaryKey(),
    adminId: text('admin_id').references(() => user.id, { onDelete: 'set null' }),
    action: text('action').$type<ModerationAction>().notNull(),
    reportId: text('report_id').references(() => reports.id, { onDelete: 'set null' }),
    petId: text('pet_id').references(() => pets.id, { onDelete: 'set null' }),
    targetUserId: text('target_user_id').references(() => user.id, { onDelete: 'set null' }),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('moderation_actions_created_idx').on(table.action, table.createdAt)],
);
