import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";

/** Soft, single call to action. No tracking, no form: it is a plain link. */
export function GroundworkCta() {
  const href = `${SITE.companyUrl}/?utm_source=tintwork&utm_medium=product&utm_campaign=palette-cta`;
  return (
    <aside aria-label={`About ${SITE.company}`} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface-muted p-5">
      <div className="max-w-xl">
        <p className="font-medium">Need this palette built into your product?</p>
        <p className="mt-1 text-sm text-muted">Tintwork is made by {SITE.company}. Talk to us about applying your design system across your web and mobile apps.</p>
      </div>
      <a href={href} rel="noopener" className="inline-flex h-9 items-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover">
        Talk to {SITE.company} <ArrowUpRight className="size-4" aria-hidden />
      </a>
    </aside>
  );
}
