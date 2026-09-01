'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { createPawTexture } from './paw-texture';

const PALETTE = ['#C06E4D', '#E0A78D', '#86A485', '#E8B75C'];

/**
 * PRNG con semilla fija (mulberry32): la dispersión es siempre la misma,
 * así el render de servidor y el de cliente coinciden y no hay saltos.
 */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

interface PawFieldProps {
  count: number;
  /** Radio de repulsión del cursor, en unidades de mundo. */
  cursorRadius?: number;
}

/**
 * Campo de huellitas que se apartan suavemente del cursor y vuelven a su sitio.
 * Todo el movimiento ocurre en un único buffer: sin re-render de React por frame.
 */
export function PawField({ count, cursorRadius = 1.6 }: PawFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createPawTexture(), []);
  const { viewport } = useThree();

  const { positions, colors, basePositions, phases, sizes } = useMemo(() => {
    const positionArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    const baseArray = new Float32Array(count * 3);
    const phaseArray = new Float32Array(count);
    const sizeArray = new Float32Array(count);
    const color = new THREE.Color();
    const random = createRandom(0x486f6d69);

    for (let index = 0; index < count; index += 1) {
      const x = (random() - 0.5) * 11;
      const y = (random() - 0.5) * 7;
      const z = (random() - 0.5) * 2.5;

      positionArray.set([x, y, z], index * 3);
      baseArray.set([x, y, z], index * 3);

      color.set(PALETTE[index % PALETTE.length]);
      colorArray.set([color.r, color.g, color.b], index * 3);

      phaseArray[index] = random() * Math.PI * 2;
      sizeArray[index] = 0.18 + random() * 0.22;
    }

    return {
      positions: positionArray,
      colors: colorArray,
      basePositions: baseArray,
      phases: phaseArray,
      sizes: sizeArray,
    };
  }, [count]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const geometry = pointsRef.current?.geometry;
    if (!geometry) return;

    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    const pointerX = (state.pointer.x * viewport.width) / 2;
    const pointerY = (state.pointer.y * viewport.height) / 2;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const baseX = basePositions[offset];
      const baseY = basePositions[offset + 1];

      const driftX = Math.sin(time * 0.22 + phases[index]) * 0.16;
      const driftY = Math.cos(time * 0.18 + phases[index]) * 0.2;

      let targetX = baseX + driftX;
      let targetY = baseY + driftY;

      const deltaX = targetX - pointerX;
      const deltaY = targetY - pointerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < cursorRadius && distance > 0.0001) {
        const push = (1 - distance / cursorRadius) * 1.1;
        targetX += (deltaX / distance) * push;
        targetY += (deltaY / distance) * push;
      }

      array[offset] += (targetX - array[offset]) * 0.06;
      array[offset + 1] += (targetY - array[offset + 1]) * 0.06;
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.42}
        sizeAttenuation
        transparent
        opacity={0.55}
        alphaTest={0.02}
        depthWrite={false}
        vertexColors
      />
    </points>
  );
}
