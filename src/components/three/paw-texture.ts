import * as THREE from 'three';

/**
 * Dibuja una huellita en un canvas 2D y la usa como sprite de partículas.
 * Evita cargar assets externos y pesa unos pocos KB en memoria.
 */
export function createPawTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.fillStyle = '#ffffff';

  const toes: [number, number, number, number, number][] = [
    [18, 24, 6, 8, -0.35],
    [30, 18, 6, 8.5, 0],
    [42, 21, 6, 8, 0.3],
    [51, 32, 5.4, 7, 0.6],
  ];

  for (const [x, y, radiusX, radiusY, rotation] of toes) {
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    context.fill();
  }

  context.beginPath();
  context.ellipse(33, 46, 15, 12, 0, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
