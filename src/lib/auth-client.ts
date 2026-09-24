'use client';

import { createAuthClient } from 'better-auth/react';

/** Cliente de auth para el navegador (misma origin: no necesita baseURL). */
export const authClient = createAuthClient();
