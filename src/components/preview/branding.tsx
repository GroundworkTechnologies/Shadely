import { PBadge, PBtn } from "./parts";
import { Mark } from "./logos";
import { usePreview } from "./context";

export function Branding() {
  const { name } = usePreview();
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-6">
      <div className="flex min-h-72 flex-col justify-between rounded-xl bg-(--p-primary) p-6 text-(--p-primary-fg) lg:col-span-3">
        <Mark name="stack" className="size-12" />
        <div>
          <p className="text-4xl font-semibold">Kilele</p>
          <p className="mt-1 opacity-90">Brand guidelines · {name} palette</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--p-border) bg-(--p-surface) p-6 lg:col-span-3">
        <p className="mb-3 text-sm font-medium">Color balance</p>
        <div className="flex h-14 overflow-hidden rounded-xl" role="img" aria-label="Color ratio 60 percent neutral, 30 percent brand, 10 percent accent">
          <div className="w-3/5 bg-(--n-100)" />
          <div className="w-[30%] bg-(--b-600)" />
          <div className="w-[10%] bg-(--w-500)" />
        </div>
        <div className="mt-2 flex text-xs text-(--p-muted)">
          <span className="w-3/5">60% neutral</span>
          <span className="w-[30%]">30% brand</span>
          <span className="w-[10%]">10% accent</span>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {[100, 300, 500, 700, 900].map((s) => (
            <div key={s} className="h-16 rounded-lg" style={{ background: `var(--b-${s})` }} role="img" aria-label={`Brand ${s}`} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-(--p-border) bg-(--p-surface) p-6 lg:col-span-2">
        <p className="text-sm font-medium">Typography</p>
        <p className="mt-3 text-7xl font-normal leading-none text-(--p-soft-fg)">Aa</p>
        <p className="mt-3 text-sm text-(--p-muted)">Display 700 · Body 400 · Caption 500</p>
      </div>

      <div className="flex flex-col justify-between rounded-xl bg-(--p-tint) p-6 text-(--p-tint-fg) lg:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">Business card</p>
        <div className="mt-4 rounded-xl bg-(--p-surface) p-4 text-(--p-fg)">
          <Mark name="stack" className="size-6 text-(--p-primary)" />
          <p className="mt-6 font-medium">Amani Wanjiru</p>
          <p className="text-sm text-(--p-muted)">Creative director</p>
          <p className="mt-3 text-xs text-(--p-muted)">amani@kilele.example · Nairobi</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--p-border) bg-(--p-surface) p-6 lg:col-span-2">
        <p className="text-sm font-medium">Voice and tone</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <PBadge>Confident</PBadge>
          <PBadge tone="success">Warm</PBadge>
          <PBadge tone="info">Clear</PBadge>
          <PBadge tone="warning">Playful</PBadge>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <PBtn>Primary</PBtn>
          <PBtn kind="secondary">Secondary</PBtn>
          <PBtn kind="soft">Soft</PBtn>
        </div>
      </div>
    </div>
  );
}
