import type { NotificationType } from './notification-types';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSummary {
  unreadCount: number;
  items: NotificationItem[];
}
