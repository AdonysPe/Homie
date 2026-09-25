export const NOTIFICATION_TYPES = [
  'new_request',
  'new_message',
  'adoption_accepted',
  'adoption_rejected',
  'adoption_completed',
  'review_received',
  'report_resolved',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
