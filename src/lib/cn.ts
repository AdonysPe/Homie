/**
 * Une clases condicionales sin dependencias externas.
 * Suficiente para el tamaño de este proyecto (no hay conflictos de variantes complejas).
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
