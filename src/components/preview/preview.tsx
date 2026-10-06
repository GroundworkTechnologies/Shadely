"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import type { NamedScale, PreviewTheme } from "@/engine";
import { previewVars } from "@/lib/preview-theme";
import { Dashboard } from "./dashboard";
import { FormsDemo } from "./forms";
import { Landing } from "./landing";

type Tab = "landing" | "dashboard" | "forms";

export function Preview({ scales, theme, onTheme }: { scales: NamedScale[]; theme: PreviewTheme; onTheme: (t: PreviewTheme) => void }) {
  const [tab, setTab] = useState<Tab>("landing");
  return (
    <section aria-labelledby="preview-h" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="preview-h" className="text-base font-semibold">
          Live preview
        </h2>
        <div className="flex flex-wrap gap-2">
          <Segmented
            label="Preview page"
            value={tab}
            onChange={setTab}
            options={[
              { value: "landing", label: "Landing" },
              { value: "dashboard", label: "Dashboard" },
              { value: "forms", label: "Forms" },
            ]}
          />
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
      <div
        style={{ ...previewVars(scales, theme), colorScheme: theme } as React.CSSProperties}
        className="overflow-hidden rounded-2xl border border-border bg-(--p-bg) text-(--p-fg)"
      >
        {tab === "landing" && <Landing />}
        {tab === "dashboard" && <Dashboard />}
        {tab === "forms" && <FormsDemo />}
      </div>
    </section>
  );
}
