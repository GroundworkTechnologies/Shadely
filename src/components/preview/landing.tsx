import { BarChart3, Check, Layers, ShieldCheck, Zap } from "lucide-react";
import { PBadge, PBtn, PCard } from "./parts";

const FEATURES = [
  [Zap, "Fast by default", "Pages that load before a visitor can blink."],
  [ShieldCheck, "Secure", "Sensible defaults and no surprises."],
  [BarChart3, "Clear insight", "Numbers that explain themselves."],
  [Layers, "Composable", "Small parts that fit together cleanly."],
] as const;

const PLANS = [
  ["Starter", "$0", false],
  ["Team", "$29", true],
  ["Scale", "$99", false],
] as const;

/** Section wrapper: one consistent horizontal and vertical rhythm for the whole page. */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`px-5 py-10 @2xl:px-10 @2xl:py-14 ${className}`}>{children}</section>;
}

export function Landing() {
  return (
    <div>
      <nav className="flex items-center justify-between gap-3 border-b border-(--p-border) bg-(--p-surface) px-5 py-3 text-sm @2xl:px-10">
        <span className="font-medium">Acme</span>
        <div className="hidden gap-6 text-(--p-muted) @2xl:flex">
          <span>Product</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <PBtn className="h-8 shrink-0">Sign in</PBtn>
      </nav>

      <Section className="text-center">
        <PBadge>New · v2.0</PBadge>
        <h3 className="mx-auto mt-5 max-w-2xl text-3xl font-medium @2xl:text-5xl">Ship interfaces your whole team can read</h3>
        <p className="mx-auto mt-4 max-w-md text-(--p-muted)">A short supporting line that shows how muted text sits on your background color.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <PBtn className="h-10 px-5">Get started</PBtn>
          <PBtn kind="secondary" className="h-10 px-5">
            Live demo
          </PBtn>
        </div>
      </Section>

      <Section className="border-t border-(--p-border) bg-(--p-surface)">
        <div className="grid gap-6 @lg:grid-cols-2 @4xl:grid-cols-4">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title}>
              <span className="grid size-10 place-items-center rounded-lg bg-(--p-soft) text-(--p-soft-fg)">
                <Icon className="size-5" aria-hidden />
              </span>
              <h4 className="mt-4 font-medium">{title}</h4>
              <p className="mt-1 text-sm text-(--p-muted)">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-6 @2xl:pb-8">
        <h4 className="text-center text-2xl font-medium">Simple pricing</h4>
        <div className="mt-8 grid gap-4 @2xl:grid-cols-3">
          {PLANS.map(([name, price, featured]) => (
            <PCard key={name} className={featured ? "border-2 border-(--p-primary)" : ""}>
              <div className="flex items-center justify-between">
                <h5 className="font-medium">{name}</h5>
                {featured ? <PBadge>Popular</PBadge> : null}
              </div>
              <p className="mt-3 text-3xl font-medium">
                {price}
                <span className="text-sm font-normal text-(--p-muted)"> /mo</span>
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-(--p-muted)">
                {["Unlimited projects", "Email support", "Export anywhere"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-(--p-soft-fg)" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
              <PBtn kind={featured ? "primary" : "secondary"} className="mt-5 w-full">
                Choose {name}
              </PBtn>
            </PCard>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-xl bg-(--p-primary) px-6 py-10 text-center text-(--p-primary-fg) @2xl:py-12">
          <h4 className="text-2xl font-medium">Ready when you are</h4>
          <p className="mx-auto mt-2 max-w-sm text-sm opacity-90">Start free. Upgrade when the team grows.</p>
          <span className="mt-6 inline-flex h-10 items-center rounded-lg bg-(--p-primary-fg) px-5 text-sm font-medium text-(--p-primary)">Create account</span>
        </div>
      </Section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-(--p-border) bg-(--p-surface) px-5 py-5 text-sm text-(--p-muted) @2xl:px-10">
        <span>© Acme</span>
        <span className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </span>
      </footer>
    </div>
  );
}
