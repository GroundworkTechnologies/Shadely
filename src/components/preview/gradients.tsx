"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { usePreview } from "./context";

interface Spec {
  title: string;
  css: string;
  /**
   * Tailwind utility classes split around the palette name. Kept as parts, joined at runtime,
   * so Tailwind's source scanner never sees a half-built class and emits invalid CSS.
   */
  tw: string[];
}

const SPECS: Spec[] = [
  { title: "Soft diagonal", css: "linear-gradient(135deg, var(--b-200), var(--b-500))", tw: ["bg-linear-to-br from-", "-200 to-", "-500"] },
  { title: "Deep brand", css: "linear-gradient(160deg, var(--b-500), var(--b-900))", tw: ["bg-linear-to-br from-", "-500 to-", "-900"] },
  { title: "Three stops", css: "linear-gradient(90deg, var(--b-300), var(--b-500), var(--b-800))", tw: ["bg-linear-to-r from-", "-300 via-", "-500 to-", "-800"] },
  { title: "Brand to sky", css: "linear-gradient(135deg, var(--b-500), var(--i-400))", tw: ["bg-linear-to-br from-", "-500 to-info-400"] },
  { title: "Brand to fresh", css: "linear-gradient(135deg, var(--b-500), var(--s-400))", tw: ["bg-linear-to-br from-", "-500 to-success-400"] },
  { title: "Sunset", css: "linear-gradient(135deg, var(--b-600), var(--w-400))", tw: ["bg-linear-to-br from-", "-600 to-warning-400"] },
  {
    title: "Radial glow",
    css: "radial-gradient(circle at 30% 20%, var(--b-400), var(--b-950) 70%)",
    tw: ["bg-[radial-gradient(circle_at_30%_20%,var(--color-", "-400),var(--color-", "-950)_70%)]"],
  },
  {
    title: "Mesh",
    css: "radial-gradient(at 15% 20%, var(--b-300) 0, transparent 50%), radial-gradient(at 85% 15%, var(--i-300) 0, transparent 50%), radial-gradient(at 70% 90%, var(--b-500) 0, transparent 55%), var(--b-100)",
    tw: ["custom CSS (see the gradient value)"],
  },
  { title: "Conic", css: "conic-gradient(from 200deg at 50% 50%, var(--b-300), var(--b-600), var(--b-900), var(--b-300))", tw: ["bg-conic from-", "-300 via-", "-600 to-", "-300"] },
];

function Tile({ spec, name }: { spec: Spec; name: string }) {
  const [done, setDone] = useState(false);
  const snippet = spec.tw.join(name);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {}
  };
  return (
    <figure className="overflow-hidden rounded-xl border border-(--p-border) bg-(--p-surface)">
      <div className="h-36" style={{ background: spec.css }} role="img" aria-label={`${spec.title} gradient`} />
      <figcaption className="flex items-center justify-between gap-2 p-3 text-sm">
        <div className="min-w-0">
          <p className="font-medium">{spec.title}</p>
          <p className="truncate tabular-nums text-xs text-(--p-muted)" title={snippet}>
            {snippet}
          </p>
        </div>
        <button type="button" onClick={copy} aria-label={`Copy ${spec.title} classes`} className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--p-border-strong) text-(--p-muted) hover:bg-(--p-surface-2)">
          {done ? <span className="text-xs">✓</span> : <Copy className="size-3.5" aria-hidden />}
        </button>
      </figcaption>
    </figure>
  );
}

export function Gradients() {
  const { name, scales } = usePreview();
  const hasSecondary = scales.some((s) => s.name === "secondary");
  const specs = hasSecondary
    ? [{ title: "Brand to secondary", css: "linear-gradient(135deg, var(--b-500), var(--a-400))", tw: ["bg-linear-to-br from-", "-500 to-secondary-400"] }, ...SPECS]
    : SPECS;
  return (
    <div className="grid gap-4 p-5 @lg:grid-cols-2 @5xl:grid-cols-3">
      {specs.map((s) => (
        <Tile key={s.title} spec={s} name={name} />
      ))}
    </div>
  );
}
