import { z } from 'zod';

import { REPORT_DETAILS_MAX, REPORT_REASONS } from './report-reasons';

export const reportSchema = z.object({
  petId: z.string().min(1),
  reason: z.enum(REPORT_REASONS, { error: 'Elige un motivo' }),
  details: z
    .string()
    .trim()
    .max(REPORT_DETAILS_MAX, `Máximo ${REPORT_DETAILS_MAX} caracteres`)
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
