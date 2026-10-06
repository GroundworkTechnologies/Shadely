import { ArrowDownLeft, ArrowUpRight, Home, Send, User, Wallet, Flame, Check } from "lucide-react";
import { cn } from "@/lib/cn";

function Phone({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="mx-auto flex h-[34rem] w-[17rem] shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-(--n-900) bg-(--p-bg) shadow-sm">
      <div className="flex shrink-0 justify-center pt-2" aria-hidden>
        <span className="h-4 w-20 rounded-full bg-(--n-900)" />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-(--p-border) bg-(--p-surface) py-2.5" aria-hidden>
      {[Home, Wallet, Send, User].map((I, i) => (
        <I key={i} className={cn("size-5", i === active ? "text-(--p-soft-fg)" : "text-(--p-muted)")} />
      ))}
    </div>
  );
}

function Wallet1() {
  return (
    <Phone label="Wallet app">
      <div className="relative h-full px-4 pt-4">
        <p className="text-xs text-(--p-muted)">Good morning</p>
        <p className="text-lg font-semibold">Amani</p>
        <div className="mt-3 rounded-2xl bg-(--p-primary) p-4 text-(--p-primary-fg)">
          <p className="text-xs opacity-90">Total balance</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">$8,420</p>
          <p className="mt-3 font-mono text-xs opacity-90">•••• 4821</p>
        </div>
        <div className="mt-4 flex justify-between">
          {[
            ["Send", ArrowUpRight],
            ["Receive", ArrowDownLeft],
            ["Pay", Wallet],
          ].map(([l, I]) => {
            const Icon = I as typeof Wallet;
            return (
              <div key={String(l)} className="grid justify-items-center gap-1 text-xs text-(--p-muted)">
                <span className="grid size-11 place-items-center rounded-full bg-(--p-soft) text-(--p-soft-fg)">
                  <Icon className="size-5" aria-hidden />
                </span>
                {String(l)}
              </div>
            );
          })}
        </div>
        <ul className="mt-4 grid gap-2 text-sm">
          {[
            ["Coffee Hub", "-$4.50", false],
            ["Salary", "+$2,300", true],
            ["Transport", "-$12.00", false],
          ].map(([n, a, pos]) => (
            <li key={String(n)} className="flex items-center justify-between rounded-xl bg-(--p-surface) px-3 py-2.5 border border-(--p-border)">
              <span>{String(n)}</span>
              <span className="tabular-nums" style={{ color: pos ? "var(--p-success-fg)" : "var(--p-fg)" }}>
                {String(a)}
              </span>
            </li>
          ))}
        </ul>
        <TabBar active={1} />
      </div>
    </Phone>
  );
}

function Habits() {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <Phone label="Habit tracker app">
      <div className="relative h-full px-4 pt-4">
        <p className="text-lg font-semibold">Today</p>
        <div className="mt-3 grid place-items-center rounded-2xl bg-(--p-tint) py-5 text-(--p-tint-fg)">
          <div className="relative size-32">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label="Daily goal 68 percent complete">
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--p-tint-2)" strokeWidth="10" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--p-primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${c * 0.68} ${c}`} />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <p className="text-2xl font-semibold">68%</p>
              <p className="text-[11px] opacity-80">of daily goal</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-center text-[11px] text-(--p-muted)">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="grid gap-1">
              {d}
              <span className={cn("grid size-7 place-items-center rounded-full text-xs", i < 4 ? "bg-(--p-primary) text-(--p-primary-fg)" : "bg-(--p-surface-2)")}>{i < 4 ? <Check className="size-3.5" aria-hidden /> : ""}</span>
            </div>
          ))}
        </div>
        <ul className="mt-4 grid gap-2 text-sm">
          {["Morning run", "Read 20 pages", "Drink water"].map((h, i) => (
            <li key={h} className="flex items-center gap-3 rounded-xl border border-(--p-border) bg-(--p-surface) px-3 py-2.5">
              <Flame className="size-4 text-(--p-soft-fg)" aria-hidden />
              {h}
              <span className="ml-auto text-xs text-(--p-muted)">{[5, 12, 3][i]} day streak</span>
            </li>
          ))}
        </ul>
        <TabBar active={0} />
      </div>
    </Phone>
  );
}

function Chat() {
  return (
    <Phone label="Messaging app">
      <div className="relative flex h-full flex-col px-4 pt-4">
        <div className="flex items-center gap-2 border-b border-(--p-border) pb-3">
          <span className="grid size-9 place-items-center rounded-full bg-(--p-primary) text-sm font-semibold text-(--p-primary-fg)" aria-hidden>
            K
          </span>
          <div>
            <p className="text-sm font-medium">Kamau</p>
            <p className="text-[11px]" style={{ color: "var(--p-success-fg)" }}>
              Online
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-(--p-surface-2) px-3 py-2">Did the new palette pass contrast?</p>
          <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-(--p-primary) px-3 py-2 text-(--p-primary-fg)">Every pair is AA. Shipping it today.</p>
          <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-(--p-surface-2) px-3 py-2">Perfect. Send me the link.</p>
          <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-(--p-primary) px-3 py-2 text-(--p-primary-fg)">On its way.</p>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-(--p-border-strong) bg-(--p-surface) py-1.5 pl-4 pr-1.5 text-sm text-(--p-muted)">
          Message…
          <span className="ml-auto grid size-8 place-items-center rounded-full bg-(--p-primary) text-(--p-primary-fg)">
            <Send className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Phone>
  );
}

export function Apps() {
  return (
    <div className="flex gap-6 overflow-x-auto p-6 lg:justify-center">
      <Wallet1 />
      <Habits />
      <Chat />
    </div>
  );
}
