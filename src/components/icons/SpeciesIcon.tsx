import type { ReactElement, SVGProps } from 'react';

import type { PetSpecies } from '@/types/pet';
import { PawIcon } from './PawIcon';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
});

const SPECIES_PATHS: Record<Exclude<PetSpecies, 'otro'>, ReactElement> = {
  perro: (
    <>
      <path d="M6.6 8.4C4.9 7.9 3.5 9 3.3 11c-.2 2.3.7 4.4 2.2 5.3 1 .6 2 .3 2.3-.6" />
      <path d="M17.4 8.4c1.7-.5 3.1.6 3.3 2.6.2 2.3-.7 4.4-2.2 5.3-1 .6-2 .3-2.3-.6" />
      <path d="M6.4 10.2c0-3.1 2.5-5.4 5.6-5.4s5.6 2.3 5.6 5.4c0 1.4-.2 2.5-.7 3.5-1 2.3-2.8 3.9-4.9 3.9s-3.9-1.6-4.9-3.9c-.5-1-.7-2.1-.7-3.5Z" />
      <path d="M9.8 10.6h.01M14.2 10.6h.01" />
      <path d="M12 13.5a1.1 1.1 0 1 0 0-.01" />
      <path d="M10.7 15.3c.6.5 2 .5 2.6 0" />
    </>
  ),
  gato: (
    <>
      <path d="M6.6 8.9 5.3 4.2l4 2.3" />
      <path d="M17.4 8.9l1.3-4.7-4 2.3" />
      <path d="M12 19.6c3.6 0 6.6-2.9 6.6-6.5S15.6 6.6 12 6.6 5.4 9.5 5.4 13.1s3 6.5 6.6 6.5Z" />
      <path d="M9.6 12.2h.01M14.4 12.2h.01" />
      <path d="M12 14.6l-1.1 1M12 14.6l1.1 1" />
    </>
  ),
  conejo: (
    <>
      <path d="M9.1 10.4c-.9 0-1.7-1.6-1.7-3.8S8.2 2.8 9.1 2.8s1.7 1.6 1.7 3.8-.8 3.8-1.7 3.8Z" />
      <path d="M14.9 10.4c-.9 0-1.7-1.6-1.7-3.8s.8-3.8 1.7-3.8 1.7 1.6 1.7 3.8-.8 3.8-1.7 3.8Z" />
      <path d="M12 21c2.9 0 5.2-2.3 5.2-5.1S14.9 10.8 12 10.8s-5.2 2.3-5.2 5.1S9.1 21 12 21Z" />
      <path d="M10 15.4h.01M14 15.4h.01" />
      <path d="M12 17.2v.8" />
    </>
  ),
  ave: (
    <>
      <path d="M15.1 4.5a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z" />
      <path d="M18 6.4 21.5 5.4 18.6 7.8" />
      <path d="M15.8 6.7h.01" />
      <path d="M13.1 9.8C9.6 10.5 7.1 13.2 7.1 16.4c0 1.7 1.4 3.1 3.1 3.1h2.1c3.6 0 6.6-2.9 6.6-6.5v-2.4" />
      <path d="M10.4 13.4c2 .2 3.6 1.6 4.1 3.5" />
      <path d="M11.5 19.5v1.9M14.5 19.4v2" />
      <path d="M7.3 15 3.5 16.5" />
    </>
  ),
  roedor: (
    <>
      <path d="M8.2 10.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z" />
      <path d="M15.8 10.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z" />
      <path d="M12 20.4c3.1 0 5.6-2.4 5.6-5.4S15.1 9.6 12 9.6 6.4 12 6.4 15s2.5 5.4 5.6 5.4Z" />
      <path d="M10.1 14.2h.01M13.9 14.2h.01" />
      <path d="M12 16.4v.8M12 17.2l-2 .9M12 17.2l2 .9" />
    </>
  ),
  reptil: (
    <>
      <path d="M12 2.9c1.9 0 3.4 1.4 3.4 3.2S13.9 9.3 12 9.3 8.6 7.9 8.6 6.1 10.1 2.9 12 2.9Z" />
      <path d="M10.7 5.5h.01M13.3 5.5h.01" />
      <path d="M12 9.3v4.5c0 2.7 1.6 4.5 3.7 4.5 1.6 0 2.8-1.1 2.8-2.6 0-1.2-.9-2.1-2.1-2.1" />
      <path d="m12 11.2-3.6-2.1M12 11.2l3.4-2M12 14.4l-3.5 2.3M12 14.4l2.3 1.7" />
    </>
  ),
};

export function SpeciesIcon({ species, size = 24, ...props }: IconProps & { species: PetSpecies }) {
  if (species === 'otro') {
    return <PawIcon size={size} {...props} />;
  }

  return <svg {...baseProps(size)} {...props}>{SPECIES_PATHS[species]}</svg>;
}
