'use client';

import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

const TOES: [number, number, number][] = [
  [-0.78, 0.62, 0],
  [-0.28, 0.86, 0.05],
  [0.28, 0.84, 0.05],
  [0.78, 0.56, 0],
];

/**
 * Silueta 3D de una huella: cinco esferas deformadas.
 * Sin modelos externos ni texturas: ~10 KB de geometría y siempre 60 fps.
 */
export function FloatingPaw({ color = '#D08A6A' }: { color?: string }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const targetY = state.pointer.x * 0.42;
    const targetX = -state.pointer.y * 0.3;
    group.rotation.y += (targetY - group.rotation.y) * 0.05;
    group.rotation.x += (targetX - group.rotation.x) * 0.05;
  });

  return (
    <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.55}>
      <group ref={groupRef} scale={0.92}>
        {TOES.map(([x, y, z], index) => (
          <mesh key={index} position={[x, y, z]} scale={[0.34, 0.42, 0.28]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial color={color} roughness={0.52} metalness={0.03} />
          </mesh>
        ))}
        <mesh position={[0, -0.28, 0]} scale={[1.02, 0.82, 0.5]}>
          <sphereGeometry args={[1, 36, 24]} />
          <meshStandardMaterial color={color} roughness={0.52} metalness={0.03} />
        </mesh>
      </group>
    </Float>
  );
}
