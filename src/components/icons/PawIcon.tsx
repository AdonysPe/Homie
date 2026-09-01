import type { SVGProps } from 'react';

export function PawIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      {...props}
    >
      <ellipse cx="6.8" cy="9" rx="1.9" ry="2.5" transform="rotate(-20 6.8 9)" />
      <ellipse cx="10.6" cy="6.6" rx="1.8" ry="2.6" />
      <ellipse cx="14.4" cy="6.9" rx="1.8" ry="2.6" transform="rotate(12 14.4 6.9)" />
      <ellipse cx="17.8" cy="9.6" rx="1.7" ry="2.3" transform="rotate(32 17.8 9.6)" />
      <path d="M12.2 11.4c2.9 0 5.3 2.2 5.3 4.8 0 2-1.5 3.4-3.4 3.4-1.2 0-1.8-.5-3-.5s-1.8.6-3 .6c-1.9 0-3.4-1.3-3.4-3.3 0-2.7 2.5-5 5.3-5z" />
    </svg>
  );
}
