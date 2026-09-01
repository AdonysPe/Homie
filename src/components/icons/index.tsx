import type { ReactNode, SVGProps } from 'react';

export { PawIcon } from './PawIcon';
export { SpeciesIcon } from './SpeciesIcon';

type LineIconProps = SVGProps<SVGSVGElement> & { size?: number };

function LineIcon({ size = 24, children, ...props }: LineIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CameraIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M4 8.5h2.6l1.5-2.2h7.8l1.5 2.2H20a1.5 1.5 0 0 1 1.5 1.5v7.3A1.7 1.7 0 0 1 19.8 19H4.2a1.7 1.7 0 0 1-1.7-1.7V10A1.5 1.5 0 0 1 4 8.5Z" />
    <circle cx="12" cy="13.4" r="3.2" />
  </LineIcon>
);

export const ShieldIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 3.2 5 5.8v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V5.8L12 3.2Z" />
    <path d="m9.2 12 2 2.1 3.6-4" />
  </LineIcon>
);

export const ChatIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v6.6a2.6 2.6 0 0 1-2.6 2.6H10l-4.4 3.4v-3.4H6.6A2.6 2.6 0 0 1 4 13.2V6.6Z" />
    <path d="M8.6 8.9h6.8M8.6 11.8h4.2" />
  </LineIcon>
);

export const HomeHeartIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M3.8 10.4 12 4l8.2 6.4v8.1a1.5 1.5 0 0 1-1.5 1.5H5.3a1.5 1.5 0 0 1-1.5-1.5v-8.1Z" />
    <path d="M12 17.4s-2.9-1.8-2.9-3.7A1.7 1.7 0 0 1 12 12.6a1.7 1.7 0 0 1 2.9 1.1c0 1.9-2.9 3.7-2.9 3.7Z" />
  </LineIcon>
);

export const CheckIcon = (props: LineIconProps) => (
  <LineIcon strokeWidth={2.2} {...props}>
    <path d="m4.5 12.5 4.8 4.8L19.5 7" />
  </LineIcon>
);

export const ChevronDownIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="m6 9.5 6 5.6 6-5.6" />
  </LineIcon>
);

export const ArrowRightIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </LineIcon>
);

export const ArrowLeftIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M19.5 12h-15M10.5 18l-6-6 6-6" />
  </LineIcon>
);

export const CloseIcon = (props: LineIconProps) => (
  <LineIcon strokeWidth={2} {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </LineIcon>
);

export const UploadIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 15.6V4.2M7.6 8.6 12 4.2l4.4 4.4" />
    <path d="M4.5 15v3.3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" />
  </LineIcon>
);

export const PlayIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M8.4 5.6 18.6 12 8.4 18.4V5.6Z" />
  </LineIcon>
);

export const MapPinIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 21s6.4-5.1 6.4-10A6.4 6.4 0 0 0 5.6 11c0 4.9 6.4 10 6.4 10Z" />
    <circle cx="12" cy="10.6" r="2.4" />
  </LineIcon>
);

export const ClockIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </LineIcon>
);
