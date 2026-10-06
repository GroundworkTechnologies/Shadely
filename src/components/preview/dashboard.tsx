import { BarChart3, CreditCard, Home, Settings, Users } from "lucide-react";
import { PBadge, PBtn, PCard } from "./parts";

const SERIES = ["--b-500", "--i-500", "--s-500", "--w-500", "--d-500"];
const LINE = [22, 34, 28, 46, 40, 58, 52, 70, 64, 82];
const BARS = [40, 65, 52, 80, 58, 72];
const DONUT = [38, 26, 20, 16];

function Donut() {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offsets = DONUT.map((_, i) => DONUT.slice(0, i).reduce((a, v) => a + (v / 100) * c, 0));
  return (
    <svg viewBox="0 0 100 100" className="size-32" role="img" aria-label="Share by channel: 38, 26, 20 and 16 percent">
      <g transform="rotate(-90 50 50)" fill="none" strokeWidth="16">
        {DONUT.map((v, i) => {
          const len = (v / 100) * c;
          return <circle key={i} cx="50" cy="50" r={r} stroke={`var(${SERIES[i]})`} strokeDasharray={`${len - 1} ${c - len + 1}`} strokeDashoffset={-offsets[i]!} />;
        })}
      </g>
    </svg>
  );
}

function Sidebar() {
  const items = [
    [Home, "Overview", true],
    [BarChart3, "Reports", false],
    [Users, "Customers", false],
    [CreditCard, "Billing", false],
    [Settings, "Settings", false],
  ] as const;
  return (
    <aside className="hidden w-52 shrink-0 border-r border-(--p-border) bg-(--p-surface) p-3 md:block">
      <p className="px-2 py-3 font-semibold">Acme</p>
      <nav aria-label="Dashboard preview" className="grid gap-1 text-sm">
        {items.map(([I, label, active]) => (
          <span key={label} aria-current={active ? "page" : undefined} className={active ? "flex items-center gap-2 rounded-md bg-(--p-soft) px-2.5 py-2 font-medium text-(--p-soft-fg)" : "flex items-center gap-2 rounded-md px-2.5 py-2 text-(--p-muted)"}>
            <I className="size-4" aria-hidden /> {label}
          </span>
        ))}
      </nav>
    </aside>
  );
}

export function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardMain />
      </div>
    </div>
  );
}

function DashboardMain() {
  const pts = LINE.map((v, i) => `${(i / (LINE.length - 1)) * 300},${100 - v}`).join(" ");
  return (
    <div className="grid gap-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Overview</h3>
        <PBtn kind="soft">Export CSV</PBtn>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Revenue", "$48.2k", "+12.4%", "success"],
          ["Active users", "3,204", "+3.1%", "info"],
          ["Churn", "2.4%", "+0.6%", "danger"],
        ].map(([label, value, delta, tone]) => (
          <PCard key={label}>
            <p className="text-sm text-(--p-muted)">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            <div className="mt-2">
              <PBadge tone={tone as "success"}>{delta}</PBadge>
            </div>
          </PCard>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <PCard>
          <p className="mb-3 text-sm font-medium">Traffic</p>
          <svg viewBox="0 0 300 100" className="h-40 w-full" role="img" aria-label="Line chart trending upward">
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--p-border)" strokeWidth="1" />
            ))}
            <polyline fill="none" stroke="var(--b-500)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts} />
            {BARS.map((v, i) => (
              <rect key={i} x={20 + i * 48} y={100 - v * 0.35} width="22" height={v * 0.35} rx="3" fill="var(--b-300)" opacity="0.55" />
            ))}
          </svg>
        </PCard>
        <PCard className="flex flex-col items-center gap-3">
          <p className="self-start text-sm font-medium">Channels</p>
          <Donut />
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-(--p-muted)">
            {["Direct", "Search", "Social", "Email"].map((n, i) => (
              <li key={n} className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-sm" style={{ background: `var(${SERIES[i]})` }} /> {n}
              </li>
            ))}
          </ul>
        </PCard>
      </div>
      <PCard className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--p-surface-2) text-(--p-muted)">
            <tr>
              {["Customer", "Plan", "Status", "Amount"].map((h) => (
                <th key={h} scope="col" className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Amani Ltd", "Team", "Paid", "success", "$290"],
              ["Kilele Co", "Scale", "Pending", "warning", "$990"],
              ["Savanna Inc", "Starter", "Failed", "danger", "$0"],
            ].map(([n, p, s, tone, a]) => (
              <tr key={n} className="border-t border-(--p-border)">
                <td className="px-4 py-2.5 font-medium">{n}</td>
                <td className="px-4 py-2.5 text-(--p-muted)">{p}</td>
                <td className="px-4 py-2.5">
                  <PBadge tone={tone as "success"}>{s}</PBadge>
                </td>
                <td className="px-4 py-2.5 tabular-nums">{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PCard>
    </div>
  );
}
