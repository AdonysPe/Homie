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
    default: `Adopción de mascotas en Lima | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Encuentra perros, gatos y otras mascotas en adopción en Lima. Publica gratis, conoce a las familias y coordina directamente, sin intermediarios.',
  keywords: ['adopción de mascotas Lima', 'dar en adopción', 'adoptar perro Lima', 'adoptar gato Lima', 'mascotas', 'adopción responsable Perú'],
  alternates: { canonical: '/' },
  openGraph: {
    title: `Adopción de mascotas en Lima | ${SITE.name}`,
    description: 'Encuentra perros, gatos y otras mascotas en adopción en Lima. Publica gratis y coordina directamente con las familias.',
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Homie, adopción responsable de mascotas en Lima' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Adopción de mascotas en Lima | ${SITE.name}`,
    description: 'Encuentra perros, gatos y otras mascotas en adopción en Lima. Publica gratis y coordina directamente con las familias.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/icon.svg',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE.name,
                url: SITE.url,
                email: SITE.contactEmail,
                description: 'Plataforma peruana para conectar mascotas que buscan hogar con familias adoptantes.',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE.name,
                url: SITE.url,
                inLanguage: 'es-PE',
              },
            ]).replace(/</g, '\\u003c'),
          }}
        />
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
