'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import {
  BellIcon,
  ChatIcon,
  CheckCheckIcon,
  CheckIcon,
  HomeHeartIcon,
  ShieldIcon,
  XCircleIcon,
} from '@/components/icons';
import { cn } from '@/lib/cn';
import { formatChatTimestamp } from '@/lib/format';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/server/actions/notifications';
import type { NotificationItem, NotificationSummary } from '../lib/notification-item';
import type { NotificationType } from '../lib/notification-types';
import { PushToggle } from './PushToggle';

/** Cada cuánto se refresca solo, sin que la persona tenga que recargar la página. */
const POLL_MS = 30_000;

const TYPE_ICON: Record<NotificationType, typeof BellIcon> = {
  new_request: HomeHeartIcon,
  new_message: ChatIcon,
  adoption_accepted: CheckIcon,
  adoption_rejected: XCircleIcon,
  adoption_completed: CheckCheckIcon,
  review_received: ShieldIcon,
  report_resolved: ShieldIcon,
};

export function NotificationBell({ initial }: { initial: NotificationSummary }) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch('/api/notifications/summary');
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as NotificationSummary;
        if (!cancelled) setSummary(data);
      } catch {
        // Sin conexión momentánea: se reintenta en el próximo ciclo.
      }
    };
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      containerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const openItem = (item: NotificationItem) => {
    setIsOpen(false);
    if (item.isRead) return;
    setSummary((current) => ({
      unreadCount: Math.max(0, current.unreadCount - 1),
      items: current.items.map((row) => (row.id === item.id ? { ...row, isRead: true } : row)),
    }));
    void markNotificationAsRead(item.id);
  };

  const markAllRead = () => {
    if (summary.unreadCount === 0) return;
    setSummary((current) => ({ unreadCount: 0, items: current.items.map((row) => ({ ...row, isRead: true })) }));
    void markAllNotificationsAsRead();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={
          summary.unreadCount > 0 ? `Notificaciones, ${summary.unreadCount} sin leer` : 'Notificaciones'
        }
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-cream-200 hover:text-ink-900"
      >
        <BellIcon size={21} />
        {summary.unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[0.65rem] font-bold text-white">
            {summary.unreadCount > 9 ? '9+' : summary.unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-panel border border-cream-300 bg-cream-50/95 shadow-lift backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
              <p className="text-[0.95rem] font-semibold text-ink-900">Notificaciones</p>
              {summary.unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-clay-600 hover:text-clay-700"
                >
                  Marcar todo leído
                </button>
              ) : null}
            </div>

            <div className="max-h-[22rem] overflow-y-auto">
              {summary.items.length === 0 ? (
                <p className="px-4 pb-5 pt-2 text-sm text-ink-400">Todavía no tienes notificaciones.</p>
              ) : (
                <ul className="flex flex-col">
                  {summary.items.map((item) => {
                    const Icon = TYPE_ICON[item.type];
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.link}
                          onClick={() => openItem(item)}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cream-200',
                            !item.isRead && 'bg-clay-50/60',
                          )}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-500">
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-ink-900">{item.title}</span>
                              {!item.isRead ? (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay-500" />
                              ) : null}
                            </span>
                            <span className="line-clamp-2 text-sm text-ink-500">{item.message}</span>
                            <span className="mt-0.5 block text-xs text-ink-300">
                              {formatChatTimestamp(item.createdAt)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <PushToggle />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
