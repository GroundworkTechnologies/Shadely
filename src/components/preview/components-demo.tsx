import { Bell, ChevronLeft, ChevronRight, Info, Search } from "lucide-react";
import { FormsDemo } from "./forms";
import { PBadge, PBtn, PCard } from "./parts";

export function ComponentsDemo() {
  return (
    <div>
      <FormsDemo />
      <div className="grid gap-4 px-5 pb-5 @4xl:grid-cols-3">
        <PCard>
          <p className="mb-3 text-sm font-medium">Tabs</p>
          <div role="tablist" aria-label="Example tabs" className="flex gap-1 border-b border-(--p-border)">
            {["Overview", "Activity", "Settings"].map((t, i) => (
              <span key={t} role="tab" aria-selected={i === 0} tabIndex={-1} className={i === 0 ? "-mb-px border-b-2 border-(--p-primary) px-3 py-2 text-sm font-medium text-(--p-soft-fg)" : "px-3 py-2 text-sm text-(--p-muted)"}>
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-(--p-muted)">Selected tab uses the brand tone; others stay muted.</p>
        </PCard>

        <PCard>
          <p className="mb-3 text-sm font-medium">Progress and toggles</p>
          <div className="grid gap-3">
            {[72, 45, 90].map((v) => (
              <div key={v} className="h-2 overflow-hidden rounded-full bg-(--p-soft)" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress ${v}%`}>
                <div className="h-full rounded-full bg-(--p-primary)" style={{ width: `${v}%` }} />
              </div>
            ))}
            <label className="flex items-center gap-3 text-sm">
              <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-(--p-primary)" aria-hidden>
                <span className="ml-auto mr-0.5 size-5 rounded-full bg-(--p-primary-fg)" />
              </span>
              Email alerts on
            </label>
            <label className="flex items-center gap-3 text-sm text-(--p-muted)">
              <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-(--p-border-strong)" aria-hidden>
                <span className="ml-0.5 size-5 rounded-full bg-(--p-surface)" />
              </span>
              SMS alerts off
            </label>
          </div>
        </PCard>

        <PCard>
          <p className="mb-3 text-sm font-medium">Search and pagination</p>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-(--p-border-strong) bg-(--p-surface) px-3 text-sm text-(--p-muted)">
            <Search className="size-4" aria-hidden /> Search…
          </div>
          <nav aria-label="Pagination" className="mt-4 flex items-center gap-1 text-sm">
            <PBtn kind="secondary" className="size-9 px-0" aria-label="Previous page">
              <ChevronLeft className="size-4" aria-hidden />
            </PBtn>
            {[1, 2, 3].map((n) => (
              <PBtn key={n} kind={n === 2 ? "primary" : "ghost"} className="size-9 px-0" aria-current={n === 2 ? "page" : undefined}>
                {n}
              </PBtn>
            ))}
            <PBtn kind="secondary" className="size-9 px-0" aria-label="Next page">
              <ChevronRight className="size-4" aria-hidden />
            </PBtn>
          </nav>
        </PCard>

        <PCard className="@4xl:col-span-2">
          <p className="mb-3 text-sm font-medium">Toast, tooltip and avatars</p>
          <div className="flex flex-wrap items-center gap-4">
            <div role="status" className="flex items-center gap-3 rounded-lg border border-(--p-border) bg-(--p-surface) px-4 py-3 text-sm">
              <Bell className="size-4 text-(--p-soft-fg)" aria-hidden /> Settings saved
              <PBtn kind="ghost" className="h-7 px-2">Undo</PBtn>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-(--p-fg) px-2.5 py-1.5 text-xs text-(--p-bg)">
              <Info className="size-3.5" aria-hidden /> Tooltip text
            </span>
            <div className="flex -space-x-2" aria-label="Team members">
              {["A", "K", "M", "+3"].map((a, i) => (
                <span key={a} className="grid size-9 place-items-center rounded-full border-2 border-(--p-surface) text-xs font-medium" style={{ background: `var(--b-${[600, 400, 200, 100][i]})`, color: i < 2 ? "var(--p-primary-fg)" : "var(--p-tint-fg)" }}>
                  {a}
                </span>
              ))}
            </div>
            <PBadge tone="info">Beta</PBadge>
          </div>
        </PCard>
      </div>
    </div>
  );
}
