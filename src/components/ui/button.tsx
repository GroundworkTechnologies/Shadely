import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export function buttonClass(variant: Variant = "secondary", extra?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-50",
    variant === "primary" && "bg-linear-to-b from-primary-hover to-primary text-primary-fg shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_1px_2px_oklch(0_0_0/0.3),0_8px_16px_-4px_oklch(0_0_0/0.25)] hover:brightness-110 active:translate-y-px active:shadow-[0_1px_2px_oklch(0_0_0/0.3)]",
    variant === "secondary" && "border border-border bg-surface text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.06),0_6px_14px_-4px_oklch(0_0_0/0.14)] hover:bg-surface-muted active:translate-y-px active:shadow-[0_1px_2px_oklch(0_0_0/0.06)]",
    variant === "ghost" && "text-muted hover:bg-surface-muted hover:text-foreground",
    extra,
  );
}

export function Button({
  variant,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}
