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

export const SyringeIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="m17.5 3.5 3 3M19 5l-3.2 3.2M15.8 8.2l-8.9 8.9-2.8.4.4-2.8 8.9-8.9M12.2 6l5.8 5.8M9.6 10.8l1.4 1.4M7.6 12.8l1.4 1.4M3.5 20.5l2-2" />
  </LineIcon>
);

export const PillIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <rect x="2.9" y="8.6" width="18.2" height="6.8" rx="3.4" transform="rotate(-45 12 12)" />
    <path d="m9.6 9.6 4.8 4.8" />
  </LineIcon>
);

export const HeartPulseIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 20s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.6 2.5C19.6 15.4 12 20 12 20Z" />
    <path d="M7.4 12.4h2.3l1.3-2 2 4 1.3-2h2.3" />
  </LineIcon>
);

export const ChipIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2.2" />
    <rect x="9.6" y="9.6" width="4.8" height="4.8" rx="0.8" />
    <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
  </LineIcon>
);

export const LinkIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3.1-3.1a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3.1 3.1a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2" />
  </LineIcon>
);

export const ShareIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 3.5v11M8.2 7.2 12 3.5l3.8 3.7" />
    <path d="M8.5 10.5H6.8a1.8 1.8 0 0 0-1.8 1.8v6.4a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8v-6.4a1.8 1.8 0 0 0-1.8-1.8h-1.7" />
  </LineIcon>
);

export const InfoIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 11v5M12 8.1v.1" />
  </LineIcon>
);

export const MinusIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M6.5 12h11" />
  </LineIcon>
);

/** Glifo oficial de WhatsApp, relleno: se reconoce al instante incluso a 18 px. */
export const WhatsAppIcon = ({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35Zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88Zm8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41Z" />
  </svg>
);

/** Sello de verificación (roseta con check), como el de las cuentas verificadas. */
export const VerifiedIcon = ({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M12 1.8 14.5 3.6 17.6 3.5 18.6 6.4 21.1 8.2 20.2 11.2 21.1 14.1 18.6 15.9 17.6 18.8 14.5 18.7 12 20.5 9.5 18.7 6.4 18.8 5.4 15.9 2.9 14.1 3.8 11.2 2.9 8.2 5.4 6.4 6.4 3.5 9.5 3.6Z" />
    <path d="m8.4 11.3 2.4 2.4 4.8-4.8" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FlagIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M5.5 21V4.5M5.5 4.5h11.2l-2.2 4 2.2 4H5.5" />
  </LineIcon>
);

export const MailIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <rect x="3.2" y="5.5" width="17.6" height="13" rx="2.4" />
    <path d="m4 7 8 6 8-6" />
  </LineIcon>
);

export const LockIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.4" />
    <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />
  </LineIcon>
);

export const SendIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M12 19V5.5M6.5 11 12 5.5l5.5 5.5" />
  </LineIcon>
);

export const PauseIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M9 6.5v11M15 6.5v11" />
  </LineIcon>
);

export const UserIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c.9-3.4 3.8-5.4 7-5.4s6.1 2 7 5.4" />
  </LineIcon>
);

export const EyeIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </LineIcon>
);

export const EyeOffIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M4 4l16 16M10.2 6a9.6 9.6 0 0 1 1.8-.2c5.8 0 9.2 6.2 9.2 6.2a16 16 0 0 1-2.6 3.3M6.6 7.7A15.6 15.6 0 0 0 2.8 12s3.4 6.2 9.2 6.2a8.8 8.8 0 0 0 4.1-1" />
    <path d="M9.9 10a2.8 2.8 0 0 0 4 4" />
  </LineIcon>
);

/** Doble check del "Visto", como en las apps de mensajería. */
export const CheckCheckIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="m2.5 12.5 4 4 8-9" />
    <path d="m11.5 15.5 1 1 8-9" />
  </LineIcon>
);

export const ImageIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.6" />
    <circle cx="9" cy="9.8" r="1.6" />
    <path d="m20.5 15.5-4.6-4.6a1.2 1.2 0 0 0-1.7 0L6 19.5" />
  </LineIcon>
);

export const BellIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <path d="M6 9.5a6 6 0 0 1 12 0v4.4l1.7 2.9H4.3L6 13.9V9.5Z" />
    <path d="M10 19.8a2.2 2.2 0 0 0 4 0" />
  </LineIcon>
);

export const XCircleIcon = (props: LineIconProps) => (
  <LineIcon {...props}>
    <circle cx="12" cy="12" r="8.3" />
    <path d="m9.3 9.3 5.4 5.4M14.7 9.3l-5.4 5.4" />
  </LineIcon>
);

/** Sólida (no de línea, como las demás): el color se controla con `text-*` en quien la usa. */
export const StarIcon = ({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z" />
  </svg>
);
