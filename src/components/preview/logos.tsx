import { cn } from "@/lib/cn";

/** Geometric marks drawn with currentColor so they re-theme with the palette. */
const MARKS: Record<string, React.ReactNode> = {
  stack: (
    <>
      <rect x="4" y="4" width="10" height="24" rx="3" fill="currentColor" />
      <rect x="18" y="4" width="10" height="14" rx="3" fill="currentColor" opacity=".55" />
    </>
  ),
  orbit: (
    <>
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    </>
  ),
  peak: <path d="M3 27 15 5l6 10 3-5 5 17z" fill="currentColor" />,
  leaf: <path d="M6 26C6 12 14 5 27 5c0 13-7 21-21 21Zm0 0 12-12" fill="currentColor" stroke="none" />,
  grid: (
    <>
      <rect x="4" y="4" width="10" height="10" rx="2.5" fill="currentColor" />
      <rect x="18" y="4" width="10" height="10" rx="5" fill="currentColor" opacity=".55" />
      <rect x="4" y="18" width="10" height="10" rx="5" fill="currentColor" opacity=".55" />
      <rect x="18" y="18" width="10" height="10" rx="2.5" fill="currentColor" />
    </>
  ),
  wave: <path d="M2 20c4-10 7-10 10 0s6 10 10 0 5-8 8-4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
  spark: <path d="M16 3l3.5 9.5L29 16l-9.5 3.5L16 29l-3.5-9.5L3 16l9.5-3.5z" fill="currentColor" />,
  arch: <path d="M5 28V15a11 11 0 0 1 22 0v13h-7V15a4 4 0 0 0-8 0v13z" fill="currentColor" />,
};

export function Mark({ name, className }: { name: keyof typeof MARKS | string; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      {MARKS[name]}
    </svg>
  );
}

const TILES = [
  { mark: "stack", word: "Kilele", bg: "bg-(--p-primary) text-(--p-primary-fg)" },
  { mark: "orbit", word: "Savanna", bg: "bg-(--p-surface) text-(--p-soft-fg) border border-(--p-border)" },
  { mark: "peak", word: "Mlima", bg: "bg-(--p-tint) text-(--p-tint-fg)" },
  { mark: "leaf", word: "Majani", bg: "bg-(--n-950) text-(--b-300)" },
  { mark: "grid", word: "Jenga", bg: "bg-(--p-soft) text-(--p-soft-fg)" },
  { mark: "wave", word: "Pwani", bg: "bg-(--p-surface-2) text-(--p-primary)" },
  { mark: "spark", word: "Nuru", bg: "bg-(--p-primary) text-(--p-primary-fg)" },
  { mark: "arch", word: "Daraja", bg: "bg-(--p-surface) text-(--p-fg) border border-(--p-border)" },
];

export function Logos() {
  return (
    <div className="grid gap-4 p-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.word} role="img" aria-label={`${t.word} logo concept`} className={cn("flex h-40 flex-col items-center justify-center gap-3 rounded-2xl", t.bg)}>
            <Mark name={t.mark} className="size-12" />
            <span className="text-lg font-semibold tracking-tight">{t.word}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-(--p-border) bg-(--p-surface) p-5">
          <span className="grid size-14 place-items-center rounded-2xl bg-(--p-primary) text-(--p-primary-fg)">
            <Mark name="stack" className="size-8" />
          </span>
          <div>
            <p className="font-medium">App icon</p>
            <p className="text-sm text-(--p-muted)">Rounded square, primary fill</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-(--p-border) bg-(--p-surface) p-5">
          <span className="text-(--p-primary)">
            <Mark name="orbit" />
          </span>
          <span className="text-xl font-semibold tracking-tight">Savanna</span>
          <span className="ml-auto text-xs text-(--p-muted)">Horizontal lockup</span>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-2xl p-5" style={{ background: "linear-gradient(135deg, var(--b-400), var(--b-800))", color: "#fff" }}>
          <Mark name="spark" />
          <span className="rounded-md bg-black/45 px-2 py-1 text-sm font-semibold">Nuru on gradient</span>
        </div>
      </div>
    </div>
  );
}
