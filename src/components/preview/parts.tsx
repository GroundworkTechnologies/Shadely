import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

// shadcn/ui component recipes (new-york style), wired to the preview palette variables.
// Every preview tab shares these, so they all read as shadcn.

const focus = "outline-none focus-visible:border-(--p-ring) focus-visible:ring-[3px] focus-visible:ring-(--p-ring)/40";

export function PBtn({ kind = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "secondary" | "ghost" | "soft" | "outline" }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        focus,
        kind === "primary" && "bg-linear-to-b from-(--p-primary-hover) to-(--p-primary) text-(--p-primary-fg) shadow-[inset_0_1px_0_oklch(1_0_0/0.2),0_1px_2px_oklch(0_0_0/0.25),0_6px_12px_-4px_oklch(0_0_0/0.25)] hover:brightness-110 active:translate-y-px",
        kind === "secondary" && "bg-(--p-surface-2) text-(--p-fg) shadow-[0_1px_2px_oklch(0_0_0/0.08),0_4px_10px_-4px_oklch(0_0_0/0.12)] hover:brightness-95",
        kind === "outline" && "border border-(--p-border-strong) bg-(--p-surface) text-(--p-fg) shadow-[0_1px_2px_oklch(0_0_0/0.06),0_6px_12px_-4px_oklch(0_0_0/0.14)] hover:bg-(--p-soft) hover:text-(--p-soft-fg)",
        kind === "soft" && "bg-(--p-soft) text-(--p-soft-fg) hover:brightness-95",
        kind === "ghost" && "text-(--p-fg) hover:bg-(--p-soft) hover:text-(--p-soft-fg)",
        className,
      )}
      {...p}
    />
  );
}

export function PCard({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-(--p-border) bg-(--p-surface) p-6 text-(--p-fg) shadow-sm", className)} {...p} />;
}

export function PBadge({ tone = "brand", children }: { tone?: "brand" | "success" | "warning" | "danger" | "info" | "outline"; children: React.ReactNode }) {
  const cls =
    tone === "brand"
      ? "bg-(--p-primary) text-(--p-primary-fg) border-transparent"
      : tone === "outline"
        ? "border-(--p-border-strong) text-(--p-fg)"
        : `bg-(--p-${tone}-bg) text-(--p-${tone}-fg) border-(--p-${tone}-bd)`;
  return <span className={cn("inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}

export const pField = cn(
  "h-9 w-full min-w-0 rounded-md border border-(--p-border-strong) bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-(--p-muted)",
  focus,
);

export function PSwitch({ on, label }: { on?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span aria-hidden className={cn("inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs", on ? "bg-(--p-primary)" : "bg-(--p-border-strong)")}>
        <span className={cn("size-4 rounded-full bg-(--p-surface) transition-transform", on ? "translate-x-[calc(100%-2px)]" : "translate-x-0")} />
      </span>
      {label}
    </label>
  );
}

export function PCheckbox({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded-[4px] border shadow-xs", checked ? "border-(--p-primary) bg-(--p-primary) text-(--p-primary-fg)" : "border-(--p-border-strong)")}>
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

export function PRadio({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded-full border shadow-xs", checked ? "border-(--p-primary)" : "border-(--p-border-strong)")}>
        {checked && <span className="size-2 rounded-full bg-(--p-primary)" />}
      </span>
      {label}
    </label>
  );
}

export function PTabs({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div role="tablist" aria-label="Example tabs" className="inline-flex h-9 w-fit items-center rounded-lg bg-(--p-surface-2) p-[3px] text-(--p-muted)">
      {items.map((t, i) => (
        <span key={t} role="tab" aria-selected={i === active} tabIndex={-1} className={cn("inline-flex h-[calc(100%-1px)] items-center rounded-md px-3 text-sm font-medium", i === active && "bg-(--p-surface) text-(--p-fg) shadow-sm")}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function PProgress({ value, label }: { value: number; label: string }) {
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-(--p-tint)">
      <div className="h-full rounded-full bg-(--p-primary)" style={{ width: `${value}%` }} />
    </div>
  );
}
