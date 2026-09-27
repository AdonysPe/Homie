'use client';

import { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { subscribeToPush, unsubscribeFromPush } from '@/server/actions/notifications';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** VAPID en base64url → el formato que pide `applicationServerKey`. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

type Status = 'checking' | 'unsupported' | 'off' | 'on' | 'busy';

/** Soporte del navegador: se calcula al renderizar, no hace falta un efecto para esto. */
function initialStatus(): Status {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'checking';
  if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  return 'checking';
}

/** Avisos push opcionales: solo aparece si el sitio tiene VAPID configurado. */
export function PushToggle() {
  const [status, setStatus] = useState<Status>(initialStatus);

  useEffect(() => {
    if (status !== 'checking') return;
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? 'on' : 'off'))
      .catch(() => setStatus('off'));
  }, [status]);

  if (status === 'unsupported' || status === 'checking') return null;

  const enable = async () => {
    setStatus('busy');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('No se activaron los avisos: el navegador no dio permiso.');
        setStatus('off');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });
      const json = subscription.toJSON();
      const result = await subscribeToPush({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      if (!result.ok) {
        toast.error(result.error);
        setStatus('off');
        return;
      }
      setStatus('on');
      toast.success('Avisos push activados');
    } catch {
      toast.error('No pudimos activar los avisos push en este navegador.');
      setStatus('off');
    }
  };

  const disable = async () => {
    setStatus('busy');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
    } finally {
      setStatus('off');
    }
  };

  return (
    <div className="border-t border-cream-300 px-4 py-2.5">
      <button
        type="button"
        onClick={() => void (status === 'on' ? disable() : enable())}
        disabled={status === 'busy'}
        className="flex w-full items-center gap-2 py-1 text-left text-xs font-semibold text-ink-500 transition-colors hover:text-ink-900 disabled:opacity-60"
      >
        {status === 'busy' ? <Spinner size={13} /> : null}
        {status === 'on' ? 'Avisos push activados · Desactivar' : 'Activar avisos push en este navegador'}
      </button>
    </div>
  );
}
