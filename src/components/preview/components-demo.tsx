import { Bell, ChevronLeft, ChevronRight, Info, Search } from "lucide-react";
import { FormsDemo } from "./forms";
import { PBadge, PBtn, PCard, PProgress, PSwitch, PTabs } from "./parts";

export function ComponentsDemo() {
  return (
    <div>
      <FormsDemo />
      <div className="grid gap-4 px-5 pb-5 @4xl:grid-cols-3">
        <PCard>
          <p className="mb-3 text-sm font-medium">Tabs</p>
          <PTabs items={["Overview", "Activity", "Settings"]} />
          <p className="mt-3 text-sm text-(--p-muted)">Selected tab uses the brand tone; others stay muted.</p>
        </PCard>

        <PCard>
          <p className="mb-3 text-sm font-medium">Progress and toggles</p>
          <div className="grid gap-3">
            {[72, 45, 90].map((v) => (
              <PProgress key={v} value={v} label={`Progress ${v}%`} />
            ))}
            <PSwitch on label="Email alerts" />
            <PSwitch label="SMS alerts" />
          </div>
        </PCard>

        <PCard>
          <p className="mb-3 text-sm font-medium">Search and pagination</p>
          <div className="flex h-9 items-center gap-2 rounded-md border border-(--p-border-strong) bg-(--p-surface) px-3 text-sm shadow-xs text-(--p-muted)">
            <Search className="size-4" aria-hidden /> Search…
          </div>
          <nav aria-label="Pagination" className="mt-4 flex items-center gap-1 text-sm">
            <PBtn kind="outline" className="size-9 px-0" aria-label="Previous page">
              <ChevronLeft className="size-4" aria-hidden />
            </PBtn>
            {[1, 2, 3].map((n) => (
              <PBtn key={n} kind={n === 2 ? "outline" : "ghost"} className="size-9 px-0" aria-current={n === 2 ? "page" : undefined}>
                {n}
              </PBtn>
            ))}
            <PBtn kind="outline" className="size-9 px-0" aria-label="Next page">
              <ChevronRight className="size-4" aria-hidden />
            </PBtn>
          </nav>
        </PCard>

        <PCard className="@4xl:col-span-2">
          <p className="mb-3 text-sm font-medium">Toast, tooltip and avatars</p>
          <div className="flex flex-wrap items-center gap-4">
            <div role="status" className="flex items-center gap-3 rounded-lg border border-(--p-border) bg-(--p-surface) px-4 py-3 text-sm shadow-lg">
              <Bell className="size-4 text-(--p-soft-fg)" aria-hidden /> Settings saved
              <PBtn kind="outline" className="h-7 px-2.5 text-xs">Undo</PBtn>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-(--p-fg) px-3 py-1.5 text-xs text-(--p-bg)">
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
