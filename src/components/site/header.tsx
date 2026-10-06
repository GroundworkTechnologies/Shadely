import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Generate" },
  { href: "/palettes", label: "Saved" },
  { href: "/tailwind-colors", label: "Tailwind colors" },
];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <rect x="1" y="1" width="6" height="20" rx="2" className="fill-accent-300" />
        <rect x="8" y="1" width="6" height="20" rx="2" className="fill-accent-500" />
        <rect x="15" y="1" width="6" height="20" rx="2" className="fill-accent-800 dark:fill-accent-200" />
      </svg>
      Tintwork
    </span>
  );
}

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="page-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link href="/" aria-label="Tintwork home" className="rounded-control">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-control px-2.5 py-1.5 text-muted hover:bg-surface-muted hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
