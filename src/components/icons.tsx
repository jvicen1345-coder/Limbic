import { useId } from "react";

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Svg({ size = 18, className, style, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {children}
    </svg>
  );
}

/** The compact icon mark from the Limbic logo — a gradient node network standing in for
 *  the limbic system's neural connections. Cropped tight to the icon's own bounds (see
 *  public/logo-lockup.svg for the full lockup with wordmark + tagline, used where there's
 *  room to show it in full). Fixed brand colors, not currentColor — unlike the rest of
 *  this file's outline icons, the logo isn't meant to be recolored. */
export function LogoIcon({ size = 24, className, style }: IconProps) {
  // AppShell keeps the desktop sidebar and mobile topbar/drawer all mounted at once
  // (CSS just hides whichever doesn't apply), so a hardcoded gradient id here would
  // collide across simultaneous LogoIcon instances — a browser resolves url(#id) to the
  // *first* matching element, which could be the copy sitting inside a display:none
  // ancestor, silently rendering as an unfilled (invisible) circle everywhere else.
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="32 22 96 96" className={className} style={style} role="img" aria-label="Limbic">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#41B3D3" />
          <stop offset="100%" stopColor="#1A5276" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="70" r="48" fill={`url(#${gradientId})`} />
      <g stroke="#FFFFFF" strokeWidth="2" opacity="0.65" strokeLinecap="round">
        <line x1="60" y1="54" x2="80" y2="40" />
        <line x1="80" y1="40" x2="100" y2="54" />
        <line x1="60" y1="54" x2="54" y2="76" />
        <line x1="60" y1="54" x2="80" y2="70" />
        <line x1="80" y1="40" x2="80" y2="70" />
        <line x1="100" y1="54" x2="80" y2="70" />
        <line x1="100" y1="54" x2="106" y2="76" />
        <line x1="54" y1="76" x2="80" y2="70" />
        <line x1="80" y1="70" x2="106" y2="76" />
        <line x1="54" y1="76" x2="64" y2="96" />
        <line x1="80" y1="70" x2="64" y2="96" />
        <line x1="80" y1="70" x2="96" y2="96" />
        <line x1="106" y1="76" x2="96" y2="96" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="60" cy="54" r="4.6" opacity="0.95" />
        <circle cx="80" cy="40" r="4.6" opacity="0.95" />
        <circle cx="100" cy="54" r="4.6" opacity="0.95" />
        <circle cx="54" cy="76" r="4.6" opacity="0.95" />
        <circle cx="80" cy="70" r="7.2" />
        <circle cx="106" cy="76" r="4.6" opacity="0.95" />
        <circle cx="64" cy="96" r="4.6" opacity="0.95" />
        <circle cx="96" cy="96" r="4.6" opacity="0.95" />
      </g>
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="5" />
    </Svg>
  );
}

export function WellnessIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

export function BookmarkIcon(props: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <svg
      width={rest.size ?? 18}
      height={rest.size ?? 18}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={rest.className}
    >
      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2 3 14h8l-1 8 10-12h-8z" />
    </Svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Svg>
  );
}

export function BandageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="m8.5 4.5 11 11a2.12 2.12 0 0 1 0 3l-1 1a2.12 2.12 0 0 1-3 0l-11-11a2.12 2.12 0 0 1 0-3l1-1a2.12 2.12 0 0 1 3 0z" />
      <path d="m15 6.5 2.5-2.5" />
      <path d="m4.5 15 2.5-2.5" />
    </Svg>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.795l-9.83-4.973a2 2 0 0 0-1.806 0L.75 9.15a1 1 0 0 0 0 1.79l9.831 4.973a2 2 0 0 0 1.806 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </Svg>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="5" r="2.3" />
      <circle cx="5.5" cy="18" r="2.3" />
      <circle cx="18.5" cy="18" r="2.3" />
      <path d="M12 7.3v4.7" />
      <path d="m10.4 13.5-3.4 3" />
      <path d="m13.6 13.5 3.4 3" />
      <path d="M7.8 18h8.4" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m2 4 5 5 5-8 5 8 5-5-2 14H4Z" />
      <path d="M4 22h16" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 5 6 9H2v6h4l5 4Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </Svg>
  );
}

export function VolumeMuteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 5 6 9H2v6h4l5 4Z" />
      <path d="m17 9 5 6" />
      <path d="m22 9-5 6" />
    </Svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </Svg>
  );
}

export function FilmIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M2 8h5" />
      <path d="M2 16h5" />
      <path d="M17 8h5" />
      <path d="M17 16h5" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}
      style={props.style}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </Svg>
  );
}

export function MessageCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Svg>
  );
}

export function HeartIcon(props: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <svg
      width={rest.size ?? 18}
      height={rest.size ?? 18}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={rest.className}
      style={rest.style}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
      <path d="M3 21v-5h5" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Svg>
  );
}
