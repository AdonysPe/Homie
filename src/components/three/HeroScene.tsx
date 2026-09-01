'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

import { FloatingPaw } from './FloatingPaw';
import { PawField } from './PawField';

/** Coloca la huella 3D en proporción al viewport, no en coordenadas fijas. */
function PlacedPaw() {
  const { viewport } = useThree();

  return (
    <group
      position={[viewport.width * 0.47, viewport.height * 0.02, 0]}
      scale={Math.min(0.58, viewport.width / 17)}
    >
      <FloatingPaw />
    </group>
  );
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

/**
 * Escena del hero. Se monta solo en cliente y solo cuando el hero está a la vista.
 * `frameloop` se apaga al salir de pantalla para no gastar GPU mientras se lee el resto.
 */
export default function HeroScene({ active = true }: { active?: boolean }) {
  const isCompact = useMediaQuery('(max-width: 640px)');
  // La silueta 3D solo cabe donde el hero es de dos columnas.
  const hasRoomForPaw = useMediaQuery('(min-width: 1024px)');

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, -2, 2]} intensity={0.4} color="#86A485" />

      <PawField count={isCompact ? 26 : 70} cursorRadius={isCompact ? 1 : 1.7} />

      {hasRoomForPaw ? <PlacedPaw /> : null}
    </Canvas>
  );
}
