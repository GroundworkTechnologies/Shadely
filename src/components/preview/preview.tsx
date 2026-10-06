"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import type { NamedScale, PreviewTheme } from "@/engine";
import { cn } from "@/lib/cn";
import { previewVars } from "@/lib/preview-theme";
import { Apps } from "./apps";
import { Branding } from "./branding";
import { Cards } from "./cards";
import { Charts } from "./charts";
import { ComponentsDemo } from "./components-demo";
import { PreviewContext } from "./context";
import { Dashboard } from "./dashboard";
import { Gradients } from "./gradients";
import { Headings } from "./headings";
import { Logos } from "./logos";
import { ShadcnPreview } from "./shadcn";
import { Website } from "./website";

const TABS = [
  ["cards", "Cards", Cards],
  ["website", "Website", Website],
  ["branding", "Branding", Branding],
  ["dashboard", "Dashboard", Dashboard],
  ["components", "Components", ComponentsDemo],
  ["shadcn", "Shadcn/ui", ShadcnPreview],
  ["apps", "Apps", Apps],
  ["charts", "Charts", Charts],
  ["gradients", "Gradients", Gradients],
  ["logos", "Logos", Logos],
  ["headings", "Headings", Headings],
] as const;

type TabId = (typeof TABS)[number][0];

export function Preview({
  scales,
  name,
  theme,
  onTheme,
  onExportShadcn,
}: {
  scales: NamedScale[];
  name: string;
  theme: PreviewTheme;
  onTheme: (t: PreviewTheme) => void;
  onExportShadcn: () => void;
}) {
  const [tab, setTab] = useState<TabId>("cards");
  const Active = TABS.find((t) => t[0] === tab)![2];

  const onKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t[0] === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const id = TABS[(next + TABS.length) % TABS.length]![0];
    setTab(id);
    requestAnimationFrame(() => document.getElementById(`ptab-${id}`)?.focus());
  };

  return (
    <section aria-labelledby="preview-h" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="preview-h" className="text-base font-semibold">
          Live preview
        </h2>
        <Segmented
          label="Preview theme"
          value={theme}
          onChange={onTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </div>

      <div role="tablist" aria-label="Preview pages" onKeyDown={onKey} className="mb-3 flex gap-1 overflow-x-auto pb-1">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            id={`ptab-${id}`}
            role="tab"
            type="button"
            aria-selected={id === tab}
            aria-controls="preview-panel"
            tabIndex={id === tab ? 0 : -1}
            onClick={() => setTab(id)}
            className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm", id === tab ? "bg-foreground font-medium text-background" : "text-muted hover:bg-surface-muted hover:text-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      <PreviewContext.Provider value={{ name, theme, scales, onExportShadcn }}>
        <div
          id="preview-panel"
          role="tabpanel"
          aria-labelledby={`ptab-${tab}`}
          style={{ ...previewVars(scales, theme), colorScheme: theme } as React.CSSProperties}
          className="overflow-hidden rounded-2xl border border-border bg-(--p-bg) text-(--p-fg)"
        >
          <Active />
        </div>
      </PreviewContext.Provider>
    </section>
  );
}
