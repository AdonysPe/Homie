/** Un mensaje tal como lo ve quien está mirando el chat (`isMine` depende de quién pregunta). */
export interface ChatMessage {
  id: string;
  content: string;
  image: ChatImage | null;
  createdAt: string;
  /** Cuándo lo abrió quien lo recibió. Solo es relevante para mis mensajes ("Visto"). */
  readAt: string | null;
  isMine: boolean;
}

export interface ChatImage {
  url: string;
  width: number;
  height: number;
}

/**
 * Eventos que el servidor empuja por Server-Sent Events.
 * El nombre del evento SSE es `type`; `data` es el resto, serializado en JSON.
 */
export type ChatEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'read'; ids: string[]; readAt: string }
  | { type: 'typing'; isTyping: boolean };

/** "Escribiendo…" se considera vigente durante esta ventana desde la última pulsación. */
export const TYPING_WINDOW_MS = 5_000;
/** Cada cuánto el cliente vuelve a avisar que sigue escribiendo. */
export const TYPING_THROTTLE_MS = 2_500;

export const chatImageUrl = (imageId: string) => `/api/chat/imagenes/${imageId}`;
