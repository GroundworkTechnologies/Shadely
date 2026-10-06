"use client";

import { useState } from "react";
import { bestText } from "@/engine";

export function CopySwatch({ hex, oklch, label }: { hex: string; oklch: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(oklch);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        } catch {}
      }}
      aria-label={`${label}, ${hex}. Copy OKLCH value`}
      title={`${label}  ${oklch}  ${hex}`}
      style={{ backgroundColor: hex, color: bestText(hex).color }}
      className="flex h-12 w-full items-center justify-center text-xs font-medium hover:brightness-95"
    >
      {done ? "Copied" : label.split("-").pop()}
    </button>
  );
}
