import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import { MotionProvider } from '@/components/MotionProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Homie · Publicá a tu mascota en adopción',
  description:
    'Publicá a tu mascota en 3 minutos y elegí vos su nueva familia. Perros, gatos, conejos, aves y más. Gratis y sin intermediarios.',
  keywords: ['dar en adopción', 'rehoming', 'mascotas', 'perros', 'gatos', 'adopción responsable'],
  openGraph: {
    title: 'Homie · Publicá a tu mascota en adopción',
    description: 'Publicá a tu mascota en 3 minutos y elegí vos su nueva familia.',
    type: 'website',
    locale: 'es_AR',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF7F2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <a
          href="#publicar"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-clay-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Ir al formulario de publicación
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
