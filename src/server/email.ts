import 'server-only';

import { SITE } from '@/lib/site';

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Envía emails transaccionales con la API HTTP de Resend (sin SDK).
 * Sin `RESEND_API_KEY` (desarrollo), los imprime en la consola del servidor
 * para poder seguir el enlace de verificación a mano.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info(`\n[email] Para: ${message.to}\n[email] Asunto: ${message.subject}\n${message.text}\n`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${SITE.name} <no-responder@homie.pet>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo enviar el email (${response.status})`);
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Plantilla compartida para avisos transaccionales (nueva solicitud, mensaje, decisión…). */
export function simpleEmail(params: {
  subject: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): Omit<EmailMessage, 'to'> {
  const { subject, heading, body, ctaLabel, ctaUrl } = params;
  return {
    subject,
    text: `${heading}\n\n${body}\n\n${ctaLabel}: ${ctaUrl}`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#2A2521">
  <p style="font-size:17px;font-weight:600;margin:0 0 12px">${escapeHtml(heading)}</p>
  <p style="font-size:15px;line-height:1.5;color:#4A423B;margin:0 0 24px">${escapeHtml(body)}</p>
  <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#C06E4D;color:#fff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:999px">${escapeHtml(ctaLabel)}</a>
</div>`,
  };
}

export function verificationEmail(name: string, url: string): Omit<EmailMessage, 'to'> {
  const safeName = escapeHtml(name);
  return {
    subject: `Confirma tu email en ${SITE.name}`,
    text: `Hola ${name}:\n\nConfirma tu email para publicar y escribirle a otras familias:\n${url}\n\nSi no creaste una cuenta en ${SITE.name}, ignora este mensaje.`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#2A2521">
  <p style="font-size:17px;margin:0 0 16px">Hola ${safeName}:</p>
  <p style="font-size:15px;line-height:1.5;color:#4A423B;margin:0 0 24px">Confirma tu email para publicar y escribirle a otras familias.</p>
  <a href="${escapeHtml(url)}" style="display:inline-block;background:#C06E4D;color:#fff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:999px">Confirmar mi email</a>
  <p style="font-size:13px;color:#8C8077;margin:32px 0 0">Si no creaste una cuenta en ${SITE.name}, ignora este mensaje.</p>
</div>`,
  };
}
