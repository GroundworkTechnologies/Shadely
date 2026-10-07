import { BarChart3, Check, Layers, ShieldCheck, Star, Zap } from "lucide-react";
import { Mark } from "./logos";
import { PBadge, PBtn, PCard } from "./parts";
import { Photo, type PhotoName } from "./photo";

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

const QUOTES: { photo: PhotoName; name: string; role: string; text: string }[] = [
  { photo: "woman1", name: "Amani Wanjiru", role: "Head of Design", text: "We changed our brand color on a Friday and every screen was still readable by Monday." },
  { photo: "man1", name: "Kamau Otieno", role: "Engineering Lead", text: "The scales drop straight into Tailwind. No more guessing which shade passes." },
  { photo: "woman2", name: "Zuri Mwangi", role: "Founder", text: "It made our product feel like one team built it, even though three did." },
];

/** Section wrapper: one consistent horizontal and vertical rhythm for the whole page. */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`px-5 py-10 @2xl:px-10 @2xl:py-14 ${className}`}>{children}</section>;
}

export function Landing() {
  return (
    <div>
      <nav className="flex items-center justify-between gap-3 border-b border-(--p-border) bg-(--p-surface) px-5 py-3 text-sm @2xl:px-10">
        <span className="flex items-center gap-2 font-medium text-(--p-soft-fg)">
          <Mark name="stack" className="size-6" /> <span className="text-(--p-fg)">Acme</span>
        </span>
        <div className="hidden gap-6 text-(--p-muted) @2xl:flex">
          <span>Product</span>
          <span>Customers</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <PBtn className="h-8 shrink-0">Sign in</PBtn>
      </nav>

      <Section className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-12">
        <div>
          <PBadge>New · v2.0</PBadge>
          <h3 className="mt-5 text-3xl font-normal @2xl:text-5xl">Ship interfaces your whole team can read</h3>
          <p className="mt-4 max-w-md text-(--p-muted)">A short supporting line that shows how muted text sits on your background color.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PBtn className="h-10 px-5">Get started</PBtn>
            <PBtn kind="secondary" className="h-10 px-5">
              Live demo
            </PBtn>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-(--p-muted)">
            <div className="flex -space-x-2">
              {(["woman1", "man1", "woman2"] as const).map((n) => (
                <Photo key={n} name={n} w={64} h={64} decorative className="size-8 rounded-full border-2 border-(--p-bg)" />
              ))}
            </div>
            <span>Trusted by teams worldwide</span>
          </div>
        </div>
        <Photo name="workspace" w={720} h={560} priority className="aspect-[9/7] w-full rounded-xl" />
      </Section>

      <Section className="border-y border-(--p-border) bg-(--p-surface) py-8 @2xl:py-8">
        <p className="mb-5 text-center text-sm text-(--p-muted)">Trusted by teams worldwide</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-(--p-muted)">
          {[
            ["orbit", "Savanna"],
            ["peak", "Mlima"],
            ["leaf", "Majani"],
            ["wave", "Pwani"],
            ["arch", "Daraja"],
          ].map(([m, n]) => (
            <span key={n} className="flex items-center gap-2 font-medium">
              <Mark name={m!} className="size-6" /> {n}
            </span>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h4 className="text-2xl font-normal @2xl:text-3xl">Everything a modern team needs</h4>
          <p className="mt-2 text-(--p-muted)">Small, sharp tools that stay out of the way.</p>
        </div>
        <div className="mt-10 grid gap-8 @lg:grid-cols-2 @4xl:grid-cols-4">
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

      <Section className="grid items-center gap-8 bg-(--p-surface) @3xl:grid-cols-2 @3xl:gap-12">
        <Photo name="analytics" w={720} h={520} className="aspect-[18/13] w-full rounded-xl @3xl:order-2" />
        <div>
          <h4 className="text-2xl font-normal @2xl:text-3xl">See what is happening, as it happens</h4>
          <p className="mt-3 max-w-md text-(--p-muted)">Live dashboards turn raw numbers into decisions your team can act on today.</p>
          <ul className="mt-5 grid gap-2 text-sm">
            {["Real-time reports", "Shareable dashboards", "Alerts that matter"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-(--p-soft-fg)" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <h4 className="text-center text-2xl font-normal @2xl:text-3xl">Customers, in their words</h4>
        <div className="mt-8 grid gap-4 @3xl:grid-cols-3">
          {QUOTES.map((q) => (
            <PCard key={q.name} className="flex flex-col">
              <div className="flex gap-0.5 text-(--p-soft-fg)" role="img" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm">“{q.text}”</p>
              <div className="mt-5 flex items-center gap-3">
                <Photo name={q.photo} w={80} h={80} className="size-10 rounded-full" />
                <div className="text-sm">
                  <p className="font-medium">{q.name}</p>
                  <p className="text-(--p-muted)">{q.role}</p>
                </div>
              </div>
            </PCard>
          ))}
        </div>
      </Section>

      <Section className="bg-(--p-surface) pb-6 @2xl:pb-8">
        <h4 className="text-center text-2xl font-normal @2xl:text-3xl">Simple pricing</h4>
        <div className="mt-8 grid gap-4 @2xl:grid-cols-3">
          {PLANS.map(([name, price, featured]) => (
            <PCard key={name} className={featured ? "border-2 border-(--p-primary)" : ""}>
              <div className="flex items-center justify-between">
                <h5 className="font-medium">{name}</h5>
                {featured ? <PBadge>Popular</PBadge> : null}
              </div>
              <p className="mt-3 text-3xl font-normal">
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

      <Section>
        <div className="grid overflow-hidden rounded-xl bg-(--p-primary) text-(--p-primary-fg) @3xl:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-10 @2xl:px-10">
            <h4 className="text-2xl font-normal @2xl:text-3xl">Ready when you are</h4>
            <p className="mt-2 max-w-sm text-sm">Start free. Upgrade when the team grows.</p>
            <span className="mt-6 inline-flex h-10 w-fit items-center rounded-lg bg-(--p-primary-fg) px-5 text-sm font-medium text-(--p-primary)">Create account</span>
          </div>
          <Photo name="highfive" w={640} h={420} className="h-56 w-full @3xl:h-full @3xl:min-h-64" />
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
