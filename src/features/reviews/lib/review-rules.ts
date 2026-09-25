export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** "Usuario confiable": más de 5 reseñas y promedio mayor a 4,5. */
export const TRUSTED_MIN_REVIEWS = 6;
export const TRUSTED_MIN_AVERAGE = 4.5;

export const isTrustedUser = (count: number, average: number): boolean =>
  count >= TRUSTED_MIN_REVIEWS && average > TRUSTED_MIN_AVERAGE;
