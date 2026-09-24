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

const shortDate = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: SITE.timeZone,
});
const timeOfDay = new Intl.DateTimeFormat('es-AR', {
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
