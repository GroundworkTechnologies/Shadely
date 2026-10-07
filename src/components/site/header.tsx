import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Generate" },
  { href: "/palettes", label: "Saved" },
  { href: "/tailwind-colors", label: "Tailwind colors" },
];

/** Light and dark logo files; the matching one is shown for the active theme. */
export function Logo() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no resizing needed */}
      <img src="/brand/shadely-logo.svg" alt="Shadely" width={102} height={28} className="h-7 w-auto dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no resizing needed */}
      <img src="/brand/shadely-logo-dark.svg" alt="" aria-hidden width={102} height={28} className="hidden h-7 w-auto dark:block" />
    </>
  );
}

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="page-container flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-6">
        <Link href="/" aria-label="Shadely home" className="rounded-control">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="flex min-w-0 items-center gap-0 text-sm sm:gap-1 sm:text-base">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-2 py-1.5 text-muted sm:px-3 hover:bg-surface-muted hover:text-foreground">
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
