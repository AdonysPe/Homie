'use client';

import { formatChatTimestamp, formatFullDateTime, formatMessageTime } from '@/lib/format';
import { useNow } from '@/lib/use-now';

/**
 * "hace 2 minutos", que se actualiza solo. Antes de hidratar muestra la hora
 * exacta (igual en servidor y cliente); la fecha completa queda en el `title`.
 */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const now = useNow();
  return (
    <time dateTime={iso} title={formatFullDateTime(iso)} className={className}>
      {now === null ? formatMessageTime(iso) : formatChatTimestamp(iso, now)}
    </time>
  );
}
