/** Contrato único de respuesta de las Server Actions: la UI siempre sabe qué mostrar. */
export type ActionErrorCode = 'unauthenticated' | 'unverified' | 'forbidden' | 'invalid' | 'rate-limited';

export interface ActionError {
  ok: false;
  error: string;
  code?: ActionErrorCode;
}

export type ActionResult<T = null> = { ok: true; data: T } | ActionError;

export const actionOk = <T,>(data: T): { ok: true; data: T } => ({ ok: true, data });

export const actionError = (error: string, code?: ActionErrorCode): ActionError => ({
  ok: false,
  error,
  code,
});
