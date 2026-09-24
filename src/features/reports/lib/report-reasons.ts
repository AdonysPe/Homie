export const REPORT_REASONS = ['adoptado', 'fraude', 'maltrato', 'otro'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportStatus = 'pendiente' | 'resuelto';

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'adoptado', label: 'Ya fue adoptado/a' },
  { value: 'fraude', label: 'Información falsa o estafa' },
  { value: 'maltrato', label: 'Maltrato animal' },
  { value: 'otro', label: 'Otro' },
];

export const REPORT_DETAILS_MAX = 500;

/**
 * Cantidad de reportes pendientes, de personas distintas con email verificado,
 * que pasan una publicación a "En revisión" automáticamente.
 * Los reportes anónimos (o de cuentas sin verificar) se guardan pero no cuentan:
 * así nadie puede ocultar publicaciones ajenas con cuentas descartables.
 */
export const AUTO_REVIEW_THRESHOLD = 3;
