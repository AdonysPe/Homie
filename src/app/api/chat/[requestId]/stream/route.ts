import type { ChatEvent } from '@/features/chat/lib/chat-types';
import { getChatParticipant, pollChatChanges } from '@/server/chat';
import { getCurrentUser } from '@/server/session';

/**
 * Tiempo real del chat por Server-Sent Events.
 *
 * Por qué SSE y no WebSockets: las funciones de Vercel no mantienen conexiones
 * WebSocket, y el chat solo necesita empujar del servidor al navegador (enviar
 * ya va por Server Actions). SSE viaja sobre HTTP normal, pasa por cualquier
 * proxy y el navegador reconecta solo (`EventSource`).
 *
 * Cómo se entera de lo nuevo: la base es la fuente de verdad compartida entre
 * instancias. Cada conexión consulta cambios cada POLL_MS con índices baratos
 * (mensajes nuevos, lecturas, "escribiendo"). Si el tráfico crece, se reemplaza
 * este bucle por un broker (Pusher, Ably, Postgres LISTEN) sin tocar la UI.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const POLL_MS = 1_500;
const HEARTBEAT_MS = 15_000;
/** Se corta antes del límite de la función; el navegador reconecta sin que se note. */
const STREAM_LIFETIME_MS = 270_000;
/** Margen al reanudar: un mensaje escrito justo antes del corte no se pierde. */
const RESUME_OVERLAP_MS = 2_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCursor(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const participant = await getChatParticipant(requestId, user.id);
  if (!participant) return new Response('Not found', { status: 404 });

  // Al reconectar, EventSource manda el último `id:` recibido; la primera vez, la página pasa `since`.
  const url = new URL(request.url);
  const resumeFrom =
    parseCursor(request.headers.get('last-event-id')) ?? parseCursor(url.searchParams.get('since')) ?? new Date();
  const start = new Date(resumeFrom.getTime() - RESUME_OVERLAP_MS);

  const encoder = new TextEncoder();
  let closed = false;
  request.signal.addEventListener('abort', () => {
    closed = true;
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };
      const emit = (event: ChatEvent, cursor: Date) => {
        const { type, ...data } = event;
        write(`id: ${cursor.toISOString()}\nevent: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      write('retry: 2000\n\n');

      const openedAt = Date.now();
      let lastHeartbeat = openedAt;
      let messagesSince = start;
      let readsSince = start;
      let wasTyping = false;
      // Mensajes ya enviados en el milisegundo del cursor (la consulta usa `>=`).
      let sentAtCursor = new Set<string>();

      try {
        while (!closed && Date.now() - openedAt < STREAM_LIFETIME_MS) {
          const changes = await pollChatChanges(participant, { messagesSince, readsSince });

          for (const { message, createdAt } of changes.messages) {
            if (createdAt.getTime() === messagesSince.getTime() && sentAtCursor.has(message.id)) continue;
            if (createdAt.getTime() > messagesSince.getTime()) {
              messagesSince = createdAt;
              sentAtCursor = new Set();
            }
            sentAtCursor.add(message.id);
            emit({ type: 'message', message }, messagesSince);
          }

          if (changes.reads.length > 0) {
            const latest = changes.reads.reduce((max, read) => (read.readAt > max ? read.readAt : max), readsSince);
            readsSince = latest;
            emit({ type: 'read', ids: changes.reads.map((read) => read.id), readAt: latest.toISOString() }, messagesSince);
          }

          if (changes.counterpartTyping !== wasTyping) {
            wasTyping = changes.counterpartTyping;
            emit({ type: 'typing', isTyping: wasTyping }, messagesSince);
          }

          if (Date.now() - lastHeartbeat > HEARTBEAT_MS) {
            // Comentario SSE: mantiene viva la conexión a través de proxies y balanceadores.
            write(': ping\n\n');
            lastHeartbeat = Date.now();
          }

          await sleep(POLL_MS);
        }
      } catch (error) {
        // Error de base transitorio: se cierra y EventSource reconecta desde el último `id`.
        console.error('[chat-stream]', error);
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // Ya cerrado por el cliente.
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Evita que un proxy intermedio acumule los eventos antes de mandarlos.
      'X-Accel-Buffering': 'no',
    },
  });
}
