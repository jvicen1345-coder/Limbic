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
 *  the limbic system's neural connections, on a flat 0-100 viewBox matching the brand
 *  source exactly (see public/logo-lockup.svg for the full lockup with wordmark + tagline,
 *  used where there's room to show it in full — and components/AgentGraph.tsx's
 *  appendLogoIcon, a hand-replicated D3 copy of this same markup for its center node).
 *  Fixed brand colors, not currentColor — unlike the rest of this file's outline icons,
 *  the logo isn't meant to be recolored. */
export function LogoIcon({ size = 24, className, style }: IconProps) {
  // AppShell keeps the desktop sidebar and mobile topbar/drawer all mounted at once
  // (CSS just hides whichever doesn't apply), so a hardcoded gradient id here would
  // collide across simultaneous LogoIcon instances — a browser resolves url(#id) to the
  // *first* matching element, which could be the copy sitting inside a display:none
  // ancestor, silently rendering as an unfilled (invisible) circle everywhere else.
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style} role="img" aria-label="Limbic">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2F6692" />
          <stop offset="45%" stopColor="#1D4D75" />
          <stop offset="75%" stopColor="#12385D" />
          <stop offset="100%" stopColor="#092744" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
      <g stroke="#F5F5F3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M50 18 L78 34 L78 68 L50 82 L22 68 L22 34 Z" />
        <path d="M50 52 L50 18" />
        <path d="M50 52 L78 34" />
        <path d="M50 52 L78 68" />
        <path d="M50 52 L50 82" />
        <path d="M50 52 L22 68" />
        <path d="M50 52 L22 34" />
      </g>
      <g fill="#F5F5F3">
        <circle cx="50" cy="18" r="7" />
        <circle cx="78" cy="34" r="7" />
        <circle cx="78" cy="68" r="7" />
        <circle cx="50" cy="82" r="7" />
        <circle cx="22" cy="68" r="7" />
        <circle cx="22" cy="34" r="7" />
        <circle cx="50" cy="52" r="10" />
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
      <path d="M12 12 12 4.3" />
      <path d="m12 12-6.2 3.6" />
      <path d="m12 12 6.2 3.6" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="12" cy="4.3" r="1.8" />
      <circle cx="5.8" cy="15.6" r="1.8" />
      <circle cx="18.2" cy="15.6" r="1.8" />
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

/** A simple four-point diamond outline — the Founding Funders sidebar link's icon (see
 *  AppShell.tsx), not shared elsewhere. */
export function DiamondIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2 L20 12 L12 22 L4 12 Z" />
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

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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

export function ImageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </Svg>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 14.5a8.5 8.5 0 1 1-9-11 7 7 0 0 0 9 11Z" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6 2 6.5H4c.5-.5 2-2 2-6.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  );
}

/** Limbic Vitals' nav icon — a heartbeat/pulse line, the conventional "vitals" mark. */
export function ActivityIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 12h-4l-3 8-4-16-3 8H2" />
    </Svg>
  );
}

/** Nutrition's nav icon — a simple apple silhouette. */
export function AppleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 7c-3 0-6 2.5-6 7 0 4 2.5 8 5 8 1.2 0 1.8-.6 3-.6s1.8.6 3 .6c2.2 0 4.5-3.5 4.5-7 0-3.5-2.3-6-5-6-1 0-1.7.3-2.5.6" />
      <path d="M12 7c0-2 1.2-4 3-4.5" />
    </Svg>
  );
}

/** Limbic Games hub — Daily Term's card icon: four letter tiles spelling "WORD", echoing
 *  the tile look of the actual game (see .wordle-tile-* in globals.css). Custom 64x64
 *  markup rather than the generic outline Svg wrapper, since this needs filled colored
 *  tiles + letters, not a single-stroke glyph. */
export function DailyTermIcon({ size = 56, className, style }: IconProps) {
  const tiles = [
    { letter: "W", x: 2, y: 24, fill: "var(--color-accent)" },
    { letter: "O", x: 17, y: 15, fill: "var(--color-accent-2)" },
    { letter: "R", x: 32, y: 15, fill: "var(--color-accent-2)" },
    { letter: "D", x: 47, y: 24, fill: "var(--color-accent)" },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={style} role="img" aria-label="Daily Term">
      {tiles.map((t) => (
        <g key={t.letter}>
          <rect x={t.x} y={t.y} width="15" height="15" rx="3.5" fill={t.fill} />
          <text x={t.x + 7.5} y={t.y + 10.8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
            {t.letter}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Limbic Games hub — Mini Crossword's card icon: a small 5x5 grid with a sparse block
 *  pattern, standing in for a filled-in crossword without needing real clue data. */
export function MiniCrosswordIcon({ size = 56, className, style }: IconProps) {
  const filled = new Set(["0,2", "1,0", "2,2", "2,4", "3,1", "4,2"]);
  const cell = 10;
  const gap = 1.5;
  const start = 4;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={style} role="img" aria-label="Mini Crossword">
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const x = start + col * (cell + gap);
          const y = start + row * (cell + gap);
          const isFilled = filled.has(`${row},${col}`);
          return (
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx="1.5"
              fill={isFilled ? "var(--color-accent-700)" : "var(--color-accent-100)"}
              stroke="var(--color-accent-300)"
              strokeWidth="1"
            />
          );
        })
      )}
    </svg>
  );
}

/** Limbic Games hub — Health Trivia's card icon: a quiz lightbulb with a question mark. */
export function HealthTriviaIcon({ size = 56, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} style={style} role="img" aria-label="Health Trivia">
      <path
        d="M32 8c-9.4 0-17 7.4-17 16.6 0 6 3.2 10.9 7.9 13.9 1.4.9 2.1 2.1 2.1 3.5v2h14v-2c0-1.4.7-2.6 2.1-3.5 4.7-3 7.9-7.9 7.9-13.9C49 15.4 41.4 8 32 8z"
        fill="var(--color-accent-100)"
        stroke="var(--color-accent-700)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M25 50h14" stroke="var(--color-accent-700)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27 55h10" stroke="var(--color-accent-700)" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M28.5 22.5c0-2.2 1.8-4 3.9-4 2.1 0 3.9 1.6 3.9 3.6 0 3.4-4.3 3.2-4.3 7.4"
        stroke="var(--color-accent-2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32.1" cy="34.8" r="1.9" fill="var(--color-accent-2)" />
    </svg>
  );
}

/** Limbic Games hub — Body Connections' card icon: a simple standing human figure outline. */
export function BodyConnectionsIcon({ size = 56, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} style={style} role="img" aria-label="Body Connections">
      <circle cx="32" cy="13" r="6.5" fill="var(--color-accent-100)" stroke="var(--color-accent-700)" strokeWidth="2.5" />
      <path
        d="M32 21c-7 0-12.5 4.6-12.5 10.5V38h5l1.5 18h5l1-14h0l1 14h5l1.5-18h5v-6.5C45.5 25.6 39 21 32 21z"
        fill="var(--color-accent-100)"
        stroke="var(--color-accent-700)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M19.5 31.5 12 27" stroke="var(--color-accent-2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44.5 31.5 52 27" stroke="var(--color-accent-2)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Top 10 Exercises' nav/card icon — a barbell. */
export function DumbbellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 3.343a2 2 0 1 1 2.829 2.829L7.466 7.94a2 2 0 1 1-2.829-2.829z" />
    </Svg>
  );
}

/** Nutrition's card icon on the Wellness Overview — a simple leaf. */
export function LeafIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 11 13 11 11" />
    </Svg>
  );
}

/** Limbic Agent Wellness' response feedback buttons — thumbs up/down. */
export function ThumbsUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </Svg>
  );
}

export function ThumbsDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </Svg>
  );
}

/** Google's own multi-color "G" mark (see app/(app)/../sign-in — components/SignInForm.tsx's
 *  "Continue with Google" button) — fixed brand colors, not currentColor, same reasoning as
 *  LogoIcon above: this one isn't meant to be recolored by the surrounding theme either. */
export function GoogleIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} style={style} role="img" aria-label="Google">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.6h7.1c4.2-3.8 6.5-9.5 6.5-16.4z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.6-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C8 41.9 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.6 28.1c-.5-1.4-.7-2.9-.7-4.5s.3-3.1.7-4.5v-5.7H4.3C2.8 16.5 2 20.1 2 24s.8 7.5 2.3 10.6z"
      />
      <path
        fill="#EA4335"
        d="M24 10.9c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.3 29.9 2 24 2 15.4 2 8 6.1 4.3 13.4l7.3 5.7c1.8-5.3 6.6-9.2 12.4-9.2z"
      />
    </svg>
  );
}
