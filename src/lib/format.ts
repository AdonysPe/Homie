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
