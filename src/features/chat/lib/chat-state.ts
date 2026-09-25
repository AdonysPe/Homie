import type { ChatMessage } from './chat-types';

/** Lo que el composer entrega al enviar: se guarda para poder reintentar si falla. */
export interface OutgoingDraft {
  content: string;
  image: { blob: Blob; width: number; height: number; previewUrl: string } | null;
}

export type LocalMessage = ChatMessage & {
  /** Id temporal del envío optimista; se conserva al confirmar para no remontar la burbuja. */
  clientId?: string;
  status: 'sent' | 'pending' | 'failed';
  draft?: OutgoingDraft;
};

export type ChatAction =
  | { type: 'received'; message: ChatMessage }
  | { type: 'send'; clientId: string; draft: OutgoingDraft }
  | { type: 'confirmed'; clientId: string; message: ChatMessage }
  | { type: 'failed'; clientId: string }
  | { type: 'retry'; clientId: string }
  | { type: 'read'; ids: string[]; readAt: string };

export const initChatState = (messages: ChatMessage[]): LocalMessage[] =>
  messages.map((message) => ({ ...message, status: 'sent' }));

/**
 * Une tres fuentes sin duplicar: el historial inicial, el stream en vivo y
 * los envíos propios. La clave es el id del servidor: un mensaje puede llegar
 * por el stream antes o después de que la Server Action confirme el envío.
 */
export function chatReducer(state: LocalMessage[], action: ChatAction): LocalMessage[] {
  switch (action.type) {
    case 'received': {
      if (state.some((message) => message.id === action.message.id)) return state;
      const next: LocalMessage = { ...action.message, status: 'sent' };
      // Los mensajes en vuelo quedan siempre al final, debajo de lo ya confirmado.
      const firstPending = state.findIndex((message) => message.status !== 'sent');
      if (firstPending === -1) return [...state, next];
      return [...state.slice(0, firstPending), next, ...state.slice(firstPending)];
    }

    case 'send':
      return [
        ...state,
        {
          id: action.clientId,
          clientId: action.clientId,
          content: action.draft.content,
          image: action.draft.image
            ? { url: action.draft.image.previewUrl, width: action.draft.image.width, height: action.draft.image.height }
            : null,
          createdAt: new Date().toISOString(),
          readAt: null,
          isMine: true,
          status: 'pending',
          draft: action.draft,
        },
      ];

    case 'confirmed': {
      // El stream pudo haberlo entregado antes: entonces solo se quita la versión optimista.
      const deliveredByStream = state.some((message) => message.id === action.message.id);
      if (deliveredByStream) return state.filter((message) => message.clientId !== action.clientId);
      return state.map((message) => {
        if (message.clientId !== action.clientId) return message;
        // Se sigue mostrando la vista previa local (ya decodificada): evita un parpadeo
        // mientras el navegador baja la misma foto desde el servidor.
        const image =
          action.message.image && message.image ? { ...action.message.image, url: message.image.url } : action.message.image;
        return { ...action.message, image, clientId: action.clientId, status: 'sent' as const, draft: message.draft };
      });
    }

    case 'failed':
      return state.map((message) =>
        message.clientId === action.clientId ? { ...message, status: 'failed' } : message,
      );

    case 'retry':
      return state.map((message) =>
        message.clientId === action.clientId ? { ...message, status: 'pending' } : message,
      );

    case 'read': {
      const ids = new Set(action.ids);
      return state.map((message) =>
        ids.has(message.id) && !message.readAt ? { ...message, readAt: action.readAt } : message,
      );
    }
  }
}
