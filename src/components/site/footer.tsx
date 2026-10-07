import Link from "next/link";
import { SITE } from "@/lib/site";
import { GitHubIcon } from "./github-icon";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container flex flex-wrap items-center justify-between gap-4 py-3 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">{SITE.name}</span> is a product of{" "}
          <a href={SITE.companyUrl} className="underline underline-offset-2 hover:text-foreground" rel="noopener">
            {SITE.company}
          </a>
          . © {new Date().getFullYear()}
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <GitHubIcon className="size-4" /> Open source on GitHub
          </a>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <a href={SITE.companyUrl} className="hover:text-foreground" rel="noopener">groundwork.co.ke</a>
        </nav>
      </div>
    </footer>
  );
}
