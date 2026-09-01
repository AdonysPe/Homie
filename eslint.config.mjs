import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescriptConfig from 'eslint-config-next/typescript';

/** Configuración plana: Next 16 ya publica sus reglas en ese formato. */
const config = [
  ...coreWebVitals,
  ...typescriptConfig,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
