import type { Dict } from "@/lib/i18n.ts";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#1a1c20" />
      <path
        d="M16 44V22l9 13 7-10 7 10 9-13v22"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="16" r="5" fill="#f2692c" />
    </svg>
  );
}

export function Brand({ t }: { t: Dict }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold">{t.studio}</div>
        <div className="text-[12px] text-muted">{t.appName}</div>
      </div>
    </div>
  );
}
