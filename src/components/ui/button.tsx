import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export function buttonClass(variant: Variant = "secondary", extra?: string) {
  return cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium transition-colors disabled:opacity-50",
    variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-hover",
    variant === "secondary" && "border border-border bg-surface text-foreground hover:bg-surface-muted",
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
