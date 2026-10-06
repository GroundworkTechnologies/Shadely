import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { PBadge, PBtn, PCard } from "./parts";

const field = "h-9 w-full rounded-lg border border-(--p-border-strong) bg-(--p-surface) px-3 text-sm placeholder:text-(--p-muted) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--p-ring)";

export function FormsDemo() {
  const alerts = [
    { tone: "success", Icon: CheckCircle2, title: "Saved", text: "Your changes were stored." },
    { tone: "info", Icon: Info, title: "Heads up", text: "A new version is available." },
    { tone: "warning", Icon: AlertTriangle, title: "Almost full", text: "You have used 90% of your quota." },
    { tone: "danger", Icon: XCircle, title: "Payment failed", text: "Update your card to continue." },
  ] as const;
  return (
    <div className="grid gap-4 p-5 @4xl:grid-cols-2">
      <PCard>
        <h3 className="font-medium">Create account</h3>
        <form className="mt-4 grid gap-3" onSubmit={(e) => e.preventDefault()}>
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input className={field} type="email" placeholder="you@example.com" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input className={field} type="password" defaultValue="hunter2hunter2" aria-invalid="true" style={{ borderColor: "var(--p-danger-solid)" }} />
            <span className="text-xs font-normal" style={{ color: "var(--p-danger-fg)" }}>
              Use at least 16 characters with a symbol.
            </span>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Plan
            <select className={field} defaultValue="team">
              <option value="starter">Starter</option>
              <option value="team">Team</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--p-primary)" }} className="size-4" /> Remember me
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="r" defaultChecked style={{ accentColor: "var(--p-primary)" }} className="size-4" /> Monthly
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="r" style={{ accentColor: "var(--p-primary)" }} className="size-4" /> Yearly
            </label>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <PBtn>Create account</PBtn>
            <PBtn kind="secondary">Cancel</PBtn>
            <PBtn kind="soft">Learn more</PBtn>
            <PBtn kind="ghost">Skip</PBtn>
          </div>
        </form>
      </PCard>
      <div className="grid content-start gap-3">
        {alerts.map(({ tone, Icon, title, text }) => (
          <div key={tone} className="flex gap-3 rounded-lg border p-3 text-sm" style={{ background: `var(--p-${tone}-bg)`, color: `var(--p-${tone}-fg)`, borderColor: `var(--p-${tone}-bd)` }}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">{title}</p>
              <p>{text}</p>
            </div>
          </div>
        ))}
        <PCard className="flex flex-wrap gap-2">
          <PBadge>Brand</PBadge>
          <PBadge tone="success">Success</PBadge>
          <PBadge tone="warning">Warning</PBadge>
          <PBadge tone="danger">Danger</PBadge>
          <PBadge tone="info">Info</PBadge>
        </PCard>
      </div>
    </div>
  );
}
