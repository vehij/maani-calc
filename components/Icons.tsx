// Line icons on a 24px grid, drawn with currentColor.

type IconProps = { size?: number; className?: string };

function Svg({ size = 18, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Clapper: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
      <path d="m4 10-.6-3.2a1 1 0 0 1 .8-1.2l13.4-2.4a1 1 0 0 1 1.2.8L19.3 7 4 10Z" />
      <path d="m8.5 5.2 2.3 3.2M13.4 4.3l2.3 3.3" />
    </Svg>
  ),
  Sparkles: (p: IconProps) => (
    <Svg {...p}>
      <path d="M10 3.5 11.6 8a2 2 0 0 0 1.2 1.2l4.5 1.6-4.5 1.6a2 2 0 0 0-1.2 1.2L10 18.1l-1.6-4.5a2 2 0 0 0-1.2-1.2l-4.5-1.6 4.5-1.6A2 2 0 0 0 8.4 8L10 3.5Z" />
      <path d="M18 14.5v5M15.5 17h5" />
    </Svg>
  ),
  Tv: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="m8 2.5 4 3.5 4-3.5M8 22h8" />
    </Svg>
  ),
  Tag: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </Svg>
  ),
  User: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />
    </Svg>
  ),
  Clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  Dollar: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v18M16.5 7.5c-.6-1.5-2.3-2.5-4.5-2.5-2.5 0-4.5 1.4-4.5 3.4 0 4.6 9 2.5 9 7.2 0 2-2 3.4-4.5 3.4-2.3 0-4-1-4.6-2.6" />
    </Svg>
  ),
  Route: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.5" />
    </Svg>
  ),
  Bolt: (p: IconProps) => (
    <Svg {...p}>
      <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />
    </Svg>
  ),
  Scale: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v18M7 21h10M5 7h14M12 5V3" />
      <path d="m5 7-3 7a3.5 3.5 0 0 0 6 0L5 7ZM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7Z" />
    </Svg>
  ),
  Gem: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 3h12l3.5 5.5L12 21 2.5 8.5 6 3Z" />
      <path d="M2.5 8.5h19M9 3l3 18 3-18" />
    </Svg>
  ),
  Sliders: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </Svg>
  ),
  Film: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21" />
    </Svg>
  ),
  Coins: (p: IconProps) => (
    <Svg {...p}>
      <ellipse cx="9" cy="7" rx="5.5" ry="2.7" />
      <path d="M3.5 7v4c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V7" />
      <ellipse cx="15" cy="14" rx="5.5" ry="2.7" />
      <path d="M9.5 14v3.3c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V14" />
    </Svg>
  ),
  Hourglass: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6.5 3h11M6.5 21h11M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />
    </Svg>
  ),
  Layers: (p: IconProps) => (
    <Svg {...p}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  ),
  Grid: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  Table: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M3 15h18M9 10v10" />
    </Svg>
  ),
  Chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 20V10M12 20V4M18 20v-7" />
    </Svg>
  ),
  Calendar: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Svg>
  ),
  Users: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.4 3.4-5.3 6.5-5.3s5.7 1.9 6.5 5.3" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.9c1.8.7 3 2.4 3.5 5.1" />
    </Svg>
  ),
  Cpu: (p: IconProps) => (
    <Svg {...p}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <path d="M9.5 9.5h5v5h-5zM9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </Svg>
  ),
  Pencil: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </Svg>
  ),
  Camera: (p: IconProps) => (
    <Svg {...p}>
      <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </Svg>
  ),
  Scissors: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="6" cy="6" r="2.8" />
      <circle cx="6" cy="18" r="2.8" />
      <path d="M8.2 7.8 20 19M8.2 16.2 20 5" />
    </Svg>
  ),
  Check: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  ),
  Download: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15" />
    </Svg>
  ),
  Logout: (p: IconProps) => (
    <Svg {...p}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
    </Svg>
  ),
  Globe: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z" />
    </Svg>
  ),
  Lock: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Svg>
  ),
  Chevron: (p: IconProps) => (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  Reset: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" />
    </Svg>
  ),
};
