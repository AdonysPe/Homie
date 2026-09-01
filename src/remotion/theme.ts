/** Tokens replicados en valores planos: Remotion renderiza fuera de Tailwind. */
export const VIDEO_THEME = {
  cream: '#FBF7F2',
  creamDeep: '#F4EDE4',
  clay: '#C06E4D',
  clayDark: '#86452E',
  clayLight: '#F6E2D8',
  sage: '#6B8C6B',
  sageLight: '#E3EBE1',
  honey: '#E8B75C',
  ink: '#2A2521',
  inkSoft: '#6E635A',
  fontFamily:
    'var(--font-display), var(--font-sans), "Segoe UI", system-ui, -apple-system, sans-serif',
} as const;

export const VIDEO_CONFIG = {
  fps: 30,
  width: 1080,
  height: 1080,
  durationInFrames: 330,
} as const;
