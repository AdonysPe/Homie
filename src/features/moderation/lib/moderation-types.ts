export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MODERATION_ACTIONS = [
  'resolve_report',
  'remove_pet',
  'suspend_user',
  'unsuspend_user',
] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];
