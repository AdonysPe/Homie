import { SITE } from './site';

/** Convierte edad + unidad en una etiqueta corta ("2 años", "5 meses"). */
export function formatAge(value: number, unit: 'meses' | 'anos'): string {
  const rounded = Math.round(value * 10) / 10;
  if (unit === 'meses') {
    return rounded === 1 ? '1 mes' : `${rounded} meses`;
  }
  return rounded === 1 ? '1 año' : `${rounded} años`;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['minute', 60_000],
  ['hour', 3_600_000],
  ['day', 86_400_000],
];

/** "hace 3 horas" — se calcula en cliente para evitar desajustes de hidratación. */
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const diff = new Date(isoDate).getTime() - now;
  const absolute = Math.abs(diff);

  if (absolute < RELATIVE_UNITS[1][1]) {
    return formatter.format(Math.round(diff / RELATIVE_UNITS[0][1]), 'minute');
  }
  if (absolute < RELATIVE_UNITS[2][1]) {
    return formatter.format(Math.round(diff / RELATIVE_UNITS[1][1]), 'hour');
  }
  return formatter.format(Math.round(diff / RELATIVE_UNITS[2][1]), 'day');
}

/** Id corto sin dependencias, suficiente para claves de UI. */
export function createId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** "Bahía Blanca" → "bahia-blanca". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

const shortDate = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  timeZone: SITE.timeZone,
});
const timeOfDay = new Intl.DateTimeFormat('es-PE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SITE.timeZone,
});
// en-CA formatea como AAAA-MM-DD: sirve de clave de día en hora local.
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: SITE.timeZone });

/** Estilo bandeja de Mail: la hora si fue hoy, "ayer", o la fecha corta. */
export function formatInboxDate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const today = dayKey.format(now);
  const yesterday = dayKey.format(new Date(now.getTime() - 86_400_000));
  const day = dayKey.format(date);
  if (day === today) return timeOfDay.format(date);
  if (day === yesterday) return 'ayer';
  return shortDate.format(date);
}

export function formatMessageTime(isoDate: string): string {
  return timeOfDay.format(new Date(isoDate));
}

export function formatShortDate(isoDate: string): string {
  return shortDate.format(new Date(isoDate));
}

const relativeLong = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const weekday = new Intl.DateTimeFormat('es-PE', { weekday: 'long', timeZone: SITE.timeZone });
const fullDateTime = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SITE.timeZone,
});

/**
 * Tiempo relativo del chat, al estilo de Mensajes:
 * "ahora" · "hace 2 minutos" · "hace 3 horas" · "ayer" · "el martes" · "12 sept."
 * Los días se cuentan en hora de Lima, no en la del servidor.
 */
export function formatChatTimestamp(isoDate: string, now: number = Date.now()): string {
  const date = new Date(isoDate);
  const diff = now - date.getTime();

  if (diff < 45_000) return 'ahora';
  if (diff < 3_600_000) return relativeLong.format(-Math.max(1, Math.round(diff / 60_000)), 'minute');

  const nowDate = new Date(now);
  const day = dayKey.format(date);
  if (day === dayKey.format(nowDate)) return relativeLong.format(-Math.round(diff / 3_600_000), 'hour');
  if (day === dayKey.format(new Date(now - 86_400_000))) return 'ayer';
  if (diff < 6 * 86_400_000) return `el ${weekday.format(date)}`;
  return shortDate.format(date);
}

/** "jueves, 25 de septiembre, 14:32": para el `title` del tiempo relativo. */
export function formatFullDateTime(isoDate: string): string {
  return fullDateTime.format(new Date(isoDate));
}
