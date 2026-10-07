"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { createLocalStore } from "@/hooks/local-store";

type Mode = "light" | "dark";
const KEY = "tintwork-theme";
const store = createLocalStore(KEY, "light");

function useMode(): Mode {
  return useSyncExternalStore(store.subscribe, store.get, () => "light") === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const mode = useMode();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const next: Mode = mode === "dark" ? "light" : "dark";
  const Icon = mode === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-control border border-border bg-surface text-muted hover:text-foreground"
      aria-label={`Theme: ${mode}. Switch to ${next}`}
      title={`Theme: ${mode}`}
      onClick={() => store.set(next)}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

/** Runs before hydration: light unless the visitor chose dark. */
export const THEME_SCRIPT = `try{document.documentElement.classList.toggle("dark",localStorage.getItem("${KEY}")==="dark")}catch(e){}`;
