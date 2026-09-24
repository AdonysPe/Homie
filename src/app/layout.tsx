import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { MotionProvider } from '@/components/MotionProvider';
import { Toaster } from '@/components/ui/Toast';
import { SITE } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · Publica a tu mascota en adopción`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Publica a tu mascota en 3 minutos y elige tú su nueva familia en Lima. Perros, gatos, conejos, aves y más. Gratis y sin intermediarios.',
  keywords: ['adopción de mascotas Lima', 'dar en adopción', 'adoptar perro Lima', 'adoptar gato Lima', 'mascotas', 'adopción responsable Perú'],
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} · Publica a tu mascota en adopción`,
    description: 'Publica a tu mascota en 3 minutos y elige tú su nueva familia.',
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF7F2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={inter.variable}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-clay-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
          {children}
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}
