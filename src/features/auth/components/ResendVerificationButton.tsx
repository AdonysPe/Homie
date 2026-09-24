'use client';

import { useState } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/cn';

/** Reenvía el email de verificación al email de la sesión actual (el propio usuario). */
export function ResendVerificationButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const resend = async () => {
    setStatus('sending');
    const { data } = await authClient.getSession();
    if (!data) {
      setStatus('idle');
      toast.error('Tu sesión expiró. Vuelve a ingresar.');
      return;
    }

    const { error } = await authClient.sendVerificationEmail({
      email: data.user.email,
      callbackURL: '/cuenta-verificada',
    });

    if (error) {
      setStatus('idle');
      toast.error(error.message ?? 'No pudimos reenviar el email. Prueba en un rato.');
      return;
    }
    setStatus('sent');
    toast.success('Te reenviamos el email de confirmación');
  };

  return (
    <button
      type="button"
      onClick={() => void resend()}
      disabled={status !== 'idle'}
      className={cn(
        'inline-flex items-center gap-2 font-semibold text-clay-600 underline decoration-clay-300 underline-offset-2 transition-colors hover:text-clay-700 disabled:cursor-default disabled:no-underline disabled:opacity-70',
        className,
      )}
    >
      {status === 'sending' ? <Spinner size={14} /> : null}
      {status === 'sent' ? 'Email reenviado' : 'Reenviar email de confirmación'}
    </button>
  );
}
