export const HOME_TYPES = ['casa-con-patio', 'departamento', 'quinta'] as const;
export type HomeType = (typeof HOME_TYPES)[number];

export const HOME_TYPE_OPTIONS: { value: HomeType; label: string }[] = [
  { value: 'casa-con-patio', label: 'Casa con patio' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'quinta', label: 'Quinta' },
];

export const homeTypeLabel = (value: HomeType): string =>
  HOME_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

/**
 * `completada`: ambas partes confirmaron que la adopción se concretó.
 * Recién ahí se habilitan las reseñas.
 */
export const REQUEST_STATUSES = ['pendiente', 'aceptada', 'rechazada', 'completada'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  completada: 'Adopción completada',
};
