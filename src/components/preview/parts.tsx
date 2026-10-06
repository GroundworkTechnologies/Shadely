import { cn } from "@/lib/cn";

export function PBtn({ kind = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "secondary" | "ghost" | "soft" }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--p-ring)",
        kind === "primary" && "bg-(--p-primary) text-(--p-primary-fg) hover:bg-(--p-primary-hover)",
        kind === "secondary" && "border border-(--p-border-strong) bg-(--p-surface) text-(--p-fg) hover:bg-(--p-surface-2)",
        kind === "soft" && "bg-(--p-soft) text-(--p-soft-fg) hover:brightness-95",
        kind === "ghost" && "text-(--p-soft-fg) hover:bg-(--p-soft)",
        className,
      )}
      {...p}
    />
  );
}

export function PCard({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-(--p-border) bg-(--p-surface) p-5", className)} {...p} />;
}

export function PBadge({ tone = "brand", children }: { tone?: "brand" | "success" | "warning" | "danger" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "brand"
      ? "bg-(--p-soft) text-(--p-soft-fg) border-transparent"
      : tone === "success"
        ? "bg-(--p-success-bg) text-(--p-success-fg) border-(--p-success-bd)"
        : tone === "warning"
          ? "bg-(--p-warning-bg) text-(--p-warning-fg) border-(--p-warning-bd)"
          : tone === "danger"
            ? "bg-(--p-danger-bg) text-(--p-danger-fg) border-(--p-danger-bd)"
            : "bg-(--p-info-bg) text-(--p-info-fg) border-(--p-info-bd)";
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}
