import { PBadge, PBtn } from "./parts";

export function Headings() {
  return (
    <div className="grid gap-4 p-5">
      <section className="rounded-xl border border-(--p-border) bg-(--p-surface) px-6 py-12 text-center">
        <PBadge>Eyebrow label</PBadge>
        <h3 className="mx-auto mt-4 max-w-2xl text-4xl font-normal sm:text-5xl">
          Design systems that <span className="rounded-lg bg-(--p-tint) px-2 text-(--p-tint-fg)">feel</span> consistent
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-(--p-muted)">Supporting copy sits in the muted tone. It stays readable on every surface of the palette.</p>
        <div className="mt-6 flex justify-center gap-3">
          <PBtn className="h-10 px-5">Primary action</PBtn>
          <PBtn kind="ghost" className="h-10 px-5">
            Secondary
          </PBtn>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-(--p-border) bg-(--p-surface) p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-(--p-soft-fg)">Type scale</p>
          <h3 className="text-4xl font-normal">Heading one</h3>
          <h4 className="mt-2 text-3xl font-normal">Heading two</h4>
          <h5 className="mt-2 text-2xl font-normal">Heading three</h5>
          <h6 className="mt-2 text-xl font-medium">Heading four</h6>
          <p className="mt-2 text-lg font-medium">Heading five</p>
          <p className="mt-2 text-base font-medium text-(--p-muted)">Heading six, muted</p>
          <p className="mt-4 text-sm text-(--p-muted)">Body text with a <a href="#headings" className="text-(--p-soft-fg) underline underline-offset-2">brand-colored link</a> inside the sentence.</p>
        </section>

        <section className="rounded-xl p-6" style={{ background: "var(--p-primary)", color: "var(--p-primary-fg)" }}>
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">On primary</p>
          <h3 className="mt-3 text-4xl font-normal">Bold statement on brand color</h3>
          <p className="mt-3 max-w-md opacity-90">Text on the primary color uses the best-contrast foreground automatically.</p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["Plan", "Build", "Ship"].map((t, i) => (
          <section key={t} className="rounded-xl border border-(--p-border) bg-(--p-surface) p-5">
            <span className="text-5xl font-normal tabular-nums text-(--p-tint-2)" aria-hidden>
              0{i + 1}
            </span>
            <h4 className="mt-2 text-xl font-medium">{t}</h4>
            <div className="mt-2 h-1 w-10 rounded-full bg-(--p-primary)" aria-hidden />
            <p className="mt-3 text-sm text-(--p-muted)">Numbered section headings with an accent rule.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
