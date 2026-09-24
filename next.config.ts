import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite carga un binario WASM propio: se usa tal cual desde node_modules.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Las migraciones SQL se leen en runtime (PGlite): tienen que viajar con las funciones.
  outputFileTracingIncludes: { '/**/*': ['./drizzle/**/*'] },
  experimental: {
    // Hasta 5 fotos ya comprimidas en el navegador (~300–600 KB cada una).
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
