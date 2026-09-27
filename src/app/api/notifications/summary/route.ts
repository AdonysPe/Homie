import { NextResponse } from 'next/server';

import { getNotificationSummary } from '@/server/notifications';
import { getCurrentUser } from '@/server/session';

/** El timbre del header sondea acá cada tanto para refrescarse sin recargar la página. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const summary = await getNotificationSummary(user.id);
  return NextResponse.json(summary, { headers: { 'Cache-Control': 'private, no-store' } });
}
