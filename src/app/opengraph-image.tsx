import { ImageResponse } from 'next/og';

export const alt = 'Homie, adopción responsable de mascotas en Lima';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '76px 88px',
          background: '#FBF7F2',
          color: '#292521',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#A95F49', fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: '#BD7056', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
              <ellipse cx="6.8" cy="9" rx="1.9" ry="2.5" transform="rotate(-20 6.8 9)" />
              <ellipse cx="10.6" cy="6.6" rx="1.8" ry="2.6" />
              <ellipse cx="14.4" cy="6.9" rx="1.8" ry="2.6" transform="rotate(12 14.4 6.9)" />
              <ellipse cx="17.8" cy="9.6" rx="1.7" ry="2.3" transform="rotate(32 17.8 9.6)" />
              <path d="M12.2 11.4c2.9 0 5.3 2.2 5.3 4.8 0 2-1.5 3.4-3.4 3.4-1.2 0-1.8-.5-3-.5s-1.8.6-3 .6c-1.9 0-3.4-1.3-3.4-3.3 0-2.7 2.5-5 5.3-5z" />
            </svg>
          </div>
          Homie
        </div>
        <div style={{ marginTop: 46, fontSize: 68, lineHeight: 1.08, fontWeight: 700, letterSpacing: -2 }}>
          Una familia para cada mascota.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: '#70675F' }}>
          Adopción responsable en Lima · Gratis y sin intermediarios
        </div>
      </div>
    ),
    size,
  );
}
