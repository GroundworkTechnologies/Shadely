import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">{SITE.name}</span> is a product of{" "}
          <a href={SITE.companyUrl} className="underline underline-offset-2 hover:text-foreground" rel="noopener">
            {SITE.company}
          </a>
          . © {new Date().getFullYear()}
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <a href={SITE.companyUrl} className="hover:text-foreground" rel="noopener">groundwork.co.ke</a>
        </nav>
      </div>
    </footer>
  );
}
