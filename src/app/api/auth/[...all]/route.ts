import { toNextJsHandler } from 'better-auth/next-js';

import { getAuth } from '@/server/auth';

// La instancia de auth se crea al primer request (la base se inicializa ahí, no en el build).
const handle = (method: 'GET' | 'POST') => async (request: Request) => {
  const auth = await getAuth();
  return toNextJsHandler(auth)[method](request);
};

export const GET = handle('GET');
export const POST = handle('POST');
