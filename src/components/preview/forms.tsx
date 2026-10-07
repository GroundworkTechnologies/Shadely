import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { PBadge, PBtn, PCard, PCheckbox, pField, PRadio } from "./parts";

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
        <h3 className="font-semibold leading-none">Create account</h3>
        <p className="mt-1.5 text-sm text-(--p-muted)">Enter your details below to get started.</p>
        <form className="mt-6 grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="grid gap-2 text-sm font-medium leading-none">
            Email
            <input className={pField} type="email" placeholder="you@example.com" />
          </label>
          <label className="grid gap-2 text-sm font-medium leading-none">
            Password
            <input className={pField} type="password" defaultValue="hunter2hunter2" aria-invalid="true" style={{ borderColor: "var(--p-danger-solid)" }} />
            <span className="text-[0.8rem] font-normal" style={{ color: "var(--p-danger-fg)" }}>
              Use at least 16 characters with a symbol.
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium leading-none">
            Plan
            <select className={pField} defaultValue="team">
              <option value="starter">Starter</option>
              <option value="team">Team</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-4">
            <PCheckbox checked label="Remember me" />
            <PRadio checked label="Monthly" />
            <PRadio label="Yearly" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <PBtn>Create account</PBtn>
            <PBtn kind="secondary">Secondary</PBtn>
            <PBtn kind="outline">Cancel</PBtn>
            <PBtn kind="ghost">Skip</PBtn>
          </div>
        </form>
      </PCard>
      <div className="grid content-start gap-3">
        {alerts.map(({ tone, Icon, title, text }) => (
          <div key={tone} role="alert" className="grid grid-cols-[1rem_1fr] items-start gap-x-3 rounded-lg border px-4 py-3 text-sm" style={{ background: `var(--p-${tone}-bg)`, color: `var(--p-${tone}-fg)`, borderColor: `var(--p-${tone}-bd)` }}>
            <Icon className="mt-0.5 size-4" aria-hidden />
            <div>
              <p className="font-medium leading-none tracking-tight">{title}</p>
              <p className="mt-1 text-sm opacity-90">{text}</p>
            </div>
          </div>
        ))}
        <PCard className="flex flex-wrap gap-2 p-4">
          <PBadge>Default</PBadge>
          <PBadge tone="outline">Outline</PBadge>
          <PBadge tone="success">Success</PBadge>
          <PBadge tone="warning">Warning</PBadge>
          <PBadge tone="danger">Destructive</PBadge>
          <PBadge tone="info">Info</PBadge>
        </PCard>
      </div>
    </div>
  );
}
