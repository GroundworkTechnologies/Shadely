"use client";

import { Segmented } from "@/components/ui/segmented";
import type { NamedScale, PreviewTheme, VisionMode } from "@/engine";
import { VisionSelect, visionStyle } from "@/components/workspace/vision";
import { cn } from "@/lib/cn";
import { previewVars } from "@/lib/preview-theme";
import dynamic from "next/dynamic";
import { Cards } from "./cards";
import { PreviewContext } from "./context";

// Only the first tab ships in the initial bundle; the rest load when opened.
const Website = dynamic(() => import("./website").then((m) => m.Website));
const Branding = dynamic(() => import("./branding").then((m) => m.Branding));
const Dashboard = dynamic(() => import("./dashboard").then((m) => m.Dashboard));
const ComponentsDemo = dynamic(() => import("./components-demo").then((m) => m.ComponentsDemo));
const ShadcnPreview = dynamic(() => import("./shadcn").then((m) => m.ShadcnPreview));
const Apps = dynamic(() => import("./apps").then((m) => m.Apps));
const Charts = dynamic(() => import("./charts").then((m) => m.Charts));
const Gradients = dynamic(() => import("./gradients").then((m) => m.Gradients));
const Logos = dynamic(() => import("./logos").then((m) => m.Logos));
const Headings = dynamic(() => import("./headings").then((m) => m.Headings));

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

export type PreviewTabId = (typeof TABS)[number][0];

export function Preview({
  scales,
  name,
  theme,
  onTheme,
  onExportShadcn,
  tab,
  onTab,
  vision,
  onVision,
}: {
  scales: NamedScale[];
  name: string;
  theme: PreviewTheme;
  onTheme: (t: PreviewTheme) => void;
  onExportShadcn: () => void;
  tab: PreviewTabId;
  onTab: (t: PreviewTabId) => void;
  vision: VisionMode;
  onVision: (m: VisionMode) => void;
}) {
  const setTab = onTab;
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
        <h2 id="preview-h" className="text-base font-medium">
          Live preview
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <VisionSelect value={vision} onChange={onVision} />
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
          style={{ ...previewVars(scales, theme), colorScheme: theme, ...visionStyle(vision) } as React.CSSProperties}
          className="@container overflow-hidden rounded-card border border-border bg-(--p-bg) text-(--p-fg)"
        >
          <Active />
        </div>
      </PreviewContext.Provider>
    </section>
  );
}
