import { Check } from "lucide-react";
import { PBadge, PBtn, PCard } from "./parts";

export function Landing() {
  return (
    <div>
      <nav className="flex items-center justify-between border-b border-(--p-border) bg-(--p-surface) px-5 py-3 text-sm">
        <span className="font-semibold">Acme</span>
        <div className="hidden gap-5 text-(--p-muted) sm:flex">
          <span>Product</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <PBtn className="h-8">Sign in</PBtn>
      </nav>
      <div className="px-5 py-12 text-center sm:py-16">
        <PBadge>New · v2.0</PBadge>
        <h3 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Ship interfaces your whole team can read</h3>
        <p className="mx-auto mt-3 max-w-md text-(--p-muted)">A short supporting line that shows how muted text sits on your background color.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <PBtn className="h-10 px-5">Get started</PBtn>
          <PBtn kind="secondary" className="h-10 px-5">
            Live demo
          </PBtn>
        </div>
      </div>
      <div className="grid gap-4 px-5 pb-8 md:grid-cols-3">
        {[
          ["Starter", "$0", false],
          ["Team", "$29", true],
          ["Scale", "$99", false],
        ].map(([name, price, featured]) => (
          <PCard key={String(name)} className={featured ? "border-2 border-(--p-primary)" : ""}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{name}</h4>
              {featured ? <PBadge>Popular</PBadge> : null}
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {price}
              <span className="text-sm font-normal text-(--p-muted)"> /mo</span>
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-(--p-muted)">
              {["Unlimited projects", "Email support", "Export anywhere"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-(--p-soft-fg)" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <PBtn kind={featured ? "primary" : "secondary"} className="mt-5 w-full">
              Choose {name}
            </PBtn>
          </PCard>
        ))}
      </div>
    </div>
  );
}
