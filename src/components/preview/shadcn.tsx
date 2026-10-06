import { AlertCircle, Terminal } from "lucide-react";
import { formatOklch, hexToOklch, SHADCN_COLOR_TOKENS, shadcnTokens } from "@/engine";
import { usePreview } from "./context";

const btn = "inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sh-ring)";

export function ShadcnPreview() {
  const { scales, theme, onExportShadcn } = usePreview();
  const t = shadcnTokens(scales, theme);
  const vars = Object.fromEntries(Object.entries(t).map(([k, v]) => [`--sh-${k}`, v])) as React.CSSProperties;

  return (
    <div className="grid gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-(--p-muted)">
          These components use the exact shadcn/ui variables Tintwork exports, in {theme} mode. Paste the theme into <code className="tabular-nums">globals.css</code> and every shadcn component picks it up.
        </p>
        <button type="button" onClick={onExportShadcn} className="inline-flex h-9 items-center rounded-lg bg-(--p-primary) px-4 text-sm font-medium text-(--p-primary-fg) hover:bg-(--p-primary-hover)">
          Get shadcn theme CSS
        </button>
      </div>

      <div style={vars} className="grid gap-4 rounded-xl bg-(--sh-background) p-4 text-(--sh-foreground) @4xl:grid-cols-2">
        <div className="self-start rounded-xl border border-(--sh-border) bg-(--sh-card) p-6 text-(--sh-card-foreground)">
          <h3 className="font-medium leading-none">Create project</h3>
          <p className="mt-1.5 text-sm text-(--sh-muted-foreground)">Deploy your new project in one click.</p>
          <div className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <input className="h-9 rounded-lg border border-(--sh-input) bg-transparent px-3 text-sm placeholder:text-(--sh-muted-foreground) focus-visible:outline-2 focus-visible:outline-(--sh-ring)" placeholder="My project" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Framework
              <select className="h-9 rounded-lg border border-(--sh-input) bg-transparent px-3 text-sm">
                <option>Next.js</option>
                <option>SvelteKit</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-between">
            <button type="button" className={`${btn} border border-(--sh-input) bg-(--sh-background) hover:bg-(--sh-accent) hover:text-(--sh-accent-foreground)`}>
              Cancel
            </button>
            <button type="button" className={`${btn} bg-(--sh-primary) text-(--sh-primary-foreground) hover:opacity-90`}>
              Deploy
            </button>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="flex flex-wrap gap-2 rounded-xl border border-(--sh-border) bg-(--sh-card) p-4">
            <button type="button" className={`${btn} bg-(--sh-primary) text-(--sh-primary-foreground)`}>Default</button>
            <button type="button" className={`${btn} bg-(--sh-secondary) text-(--sh-secondary-foreground)`}>Secondary</button>
            <button type="button" className={`${btn} border border-(--sh-input) hover:bg-(--sh-accent) hover:text-(--sh-accent-foreground)`}>Outline</button>
            <button type="button" className={`${btn} hover:bg-(--sh-accent) hover:text-(--sh-accent-foreground)`}>Ghost</button>
            <button type="button" className={`${btn} bg-(--sh-destructive) text-(--sh-destructive-foreground)`}>Destructive</button>
          </div>

          <div role="alert" className="flex gap-3 rounded-lg border border-(--sh-border) bg-(--sh-card) p-4 text-sm">
            <Terminal className="mt-0.5 size-4" aria-hidden />
            <div>
              <p className="font-medium">Heads up!</p>
              <p className="text-(--sh-muted-foreground)">You can add components with the CLI.</p>
            </div>
          </div>
          <div role="alert" className="flex gap-3 rounded-lg border border-(--sh-destructive) bg-(--sh-card) p-4 text-sm text-(--sh-card-foreground)">
            <AlertCircle className="mt-0.5 size-4 text-(--sh-destructive)" aria-hidden />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-(--sh-muted-foreground)">Your session has expired.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-(--sh-border) bg-(--sh-card) p-4 text-sm">
            <span className="rounded-lg bg-(--sh-primary) px-2 py-0.5 text-xs font-medium text-(--sh-primary-foreground)">Badge</span>
            <span className="rounded-lg bg-(--sh-secondary) px-2 py-0.5 text-xs font-medium text-(--sh-secondary-foreground)">Secondary</span>
            <span className="rounded-lg border border-(--sh-border) px-2 py-0.5 text-xs font-medium">Outline</span>
            <span className="rounded-lg bg-(--sh-muted) px-2 py-0.5 text-xs text-(--sh-muted-foreground)">Muted</span>
            <label className="ml-auto flex items-center gap-2">
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-(--sh-primary)" aria-hidden>
                <span className="ml-auto mr-0.5 size-4 rounded-full bg-(--sh-primary-foreground)" />
              </span>
              Notifications
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-(--sh-border) bg-(--sh-card)">
            <table className="w-full text-left text-sm">
              <thead className="text-(--sh-muted-foreground)">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">Invoice</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[["INV-001", "Paid", "$250.00"], ["INV-002", "Pending", "$150.00"]].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-(--sh-border) hover:bg-(--sh-muted)">
                    <td className="px-4 py-2 font-medium">{a}</td>
                    <td className="px-4 py-2">{b}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-1 @4xl:col-span-2" role="img" aria-label="Chart colors 1 to 5">
          {(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const).map((k) => (
            <div key={k} className="h-8 flex-1 first:rounded-l-md last:rounded-r-md" style={{ background: t[k] }} title={`${k} ${t[k]}`} />
          ))}
        </div>
      </div>

      <details className="rounded-xl border border-(--p-border) bg-(--p-surface) text-sm">
        <summary className="cursor-pointer px-4 py-3 font-medium">Token values ({theme})</summary>
        <dl className="grid gap-x-6 gap-y-1 border-t border-(--p-border) p-4 tabular-nums text-xs @lg:grid-cols-2">
          {SHADCN_COLOR_TOKENS.map((k) => {
            const ok = hexToOklch(t[k]!);
            return (
              <div key={k} className="flex items-center gap-2">
                <span aria-hidden className="size-4 shrink-0 rounded border border-(--p-border-strong)" style={{ background: t[k] }} />
                <dt className="text-(--p-muted)">--{k}</dt>
                <dd className="ml-auto">{ok ? formatOklch(ok) : t[k]}</dd>
              </div>
            );
          })}
        </dl>
      </details>
    </div>
  );
}
