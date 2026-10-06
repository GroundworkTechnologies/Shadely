import { ArrowUpRight, Bell, Heart, MessageCircle, Sparkles } from "lucide-react";
import { PBadge, PBtn, PCard } from "./parts";

const BARS = [
  [28, 36, 18],
  [40, 30, 32],
  [16, 22, 12],
  [34, 44, 28],
  [48, 40, 36],
  [30, 26, 22],
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function Arcs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="140" cy="150" r="30" />
      <circle cx="140" cy="150" r="60" />
      <circle cx="140" cy="150" r="90" />
    </svg>
  );
}

export function Cards() {
  return (
    <div className="grid gap-4 p-5 @2xl:grid-cols-2 @5xl:grid-cols-3">
      <div className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl bg-(--p-tint) p-5 text-(--p-tint-fg)">
        <Arcs className="absolute -bottom-6 -right-6 size-64 opacity-30" />
        <div className="relative rounded-xl bg-(--p-tint-2) p-4">
          <div className="mx-auto h-48 w-28 rotate-6 rounded-xl border-4 border-(--p-tint-fg) bg-(--p-surface) p-2">
            <div className="h-2 w-10 rounded-full bg-(--p-primary)" />
            <div className="mt-2 h-14 rounded-lg bg-(--p-soft)" />
            <div className="mt-2 space-y-1.5">
              <div className="h-2 rounded-full bg-(--p-border-strong)" />
              <div className="h-2 w-2/3 rounded-full bg-(--p-border-strong)" />
            </div>
          </div>
        </div>
        <div className="relative">
          <h3 className="text-3xl font-normal leading-tight">Track your expenses</h3>
          <p className="mt-1 text-sm">See every shilling at a glance.</p>
        </div>
      </div>

      <PCard className="flex flex-col rounded-xl">
        <p className="text-sm text-(--p-muted)">Expenses</p>
        <p className="mt-1 text-3xl font-normal tabular-nums">$12,543</p>
        <div className="mt-6 flex flex-1 items-end justify-between gap-2" role="img" aria-label="Stacked bar chart of monthly expenses">
          {BARS.map((b, i) => (
            <div key={MONTHS[i]} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full max-w-7 flex-col gap-1">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="rounded-lg" style={{ height: b[k]! * 2.2, background: `var(--b-${[300, 500, 700][k]})` }} />
                ))}
              </div>
              <span className="text-xs text-(--p-muted)">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </PCard>

      <div className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl bg-(--p-primary) p-5 text-(--p-primary-fg)">
        <Arcs className="absolute -bottom-6 -right-6 size-64 opacity-25" />
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" aria-hidden /> Premium
        </div>
        <div className="relative">
          <h3 className="text-3xl font-normal leading-tight">Gain control</h3>
          <p className="mt-1 text-sm">Budgets, goals and alerts in one place.</p>
          <span className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-(--p-primary-fg) px-4 text-sm font-medium text-(--p-primary)">
            Upgrade <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>

      <PCard className="rounded-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-(--p-primary) font-medium text-(--p-primary-fg)" aria-hidden>
            AW
          </span>
          <div>
            <p className="font-medium">Amani Wanjiru</p>
            <p className="text-sm text-(--p-muted)">Product designer</p>
          </div>
          <PBadge>Pro</PBadge>
        </div>
        <p className="mt-4 text-sm text-(--p-muted)">“Swapping our brand color took a minute, and every screen stayed readable.”</p>
        <div className="mt-4 flex gap-2">
          <PBtn>Follow</PBtn>
          <PBtn kind="secondary">
            <MessageCircle className="size-4" aria-hidden /> Message
          </PBtn>
        </div>
      </PCard>

      <PCard className="rounded-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">Notifications</p>
          <Bell className="size-4 text-(--p-muted)" aria-hidden />
        </div>
        <ul className="grid gap-2 text-sm">
          {[
            ["success", "Invoice #204 paid"],
            ["warning", "Card expires soon"],
            ["info", "New teammate joined"],
          ].map(([tone, text]) => (
            <li key={text} className="flex items-center gap-3 rounded-lg border px-3 py-2" style={{ background: `var(--p-${tone}-bg)`, color: `var(--p-${tone}-fg)`, borderColor: `var(--p-${tone}-bd)` }}>
              <span aria-hidden className="size-2 rounded-full" style={{ background: `var(--p-${tone}-solid)` }} />
              {text}
            </li>
          ))}
        </ul>
      </PCard>

      <PCard className="rounded-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-(--p-muted)">Goal progress</p>
          <Heart className="size-4 text-(--p-soft-fg)" aria-hidden />
        </div>
        <p className="mt-1 text-3xl font-normal">72%</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-(--p-soft)" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="Goal progress">
          <div className="h-full w-[72%] rounded-full bg-(--p-primary)" />
        </div>
        <div className="mt-4 flex justify-between text-xs text-(--p-muted)">
          <span>$7,200 saved</span>
          <span>$10,000 goal</span>
        </div>
      </PCard>
    </div>
  );
}
