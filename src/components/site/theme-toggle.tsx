"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { createLocalStore } from "@/hooks/local-store";

type Mode = "system" | "light" | "dark";
const ORDER: Mode[] = ["system", "light", "dark"];
const KEY = "tintwork-theme";
const store = createLocalStore(KEY, "system");

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function useMode(): Mode {
  const raw = useSyncExternalStore(store.subscribe, store.get, () => "system");
  return (ORDER as string[]).includes(raw) ? (raw as Mode) : "system";
}

export function ThemeToggle() {
  const mode = useMode();

  useEffect(() => {
    apply(mode);
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]!;
  const Icon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-foreground"
      aria-label={`Theme: ${mode}. Switch to ${next}`}
      title={`Theme: ${mode}`}
      onClick={() => store.set(next)}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

/** Runs before hydration to avoid a flash of the wrong theme. */
export const THEME_SCRIPT = `try{var m=localStorage.getItem("${KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;
