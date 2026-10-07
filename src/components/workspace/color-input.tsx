"use client";

import { Shuffle } from "lucide-react";
import { useId, useState } from "react";
import { colorName, extractBaseColor, normalizeHex } from "@/engine";
import { Button } from "@/components/ui/button";

export function ColorInput({ value, onChange, onShuffle }: { value: string; onChange: (hex: string) => void; onShuffle: () => void }) {
  const id = useId();
  // While the field is focused it shows the user's draft; otherwise the canonical value.
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const text = draft ?? value;
  const named = colorName(value);

  const commit = (raw: string) => {
    const hex = normalizeHex(raw) ?? (raw.length > 12 ? extractBaseColor(raw) : null);
    if (hex) {
      setInvalid(false);
      onChange(hex);
    } else setInvalid(raw.trim() !== "");
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-medium">
        Base color
      </label>
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="color"
          aria-label="Pick base color"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="size-12 shrink-0 cursor-pointer rounded-xl border border-border bg-surface p-1"
        />
        <input
          id={id}
          value={text}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            setDraft(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => {
            setDraft(null);
            setInvalid(false);
          }}
          className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 tabular-nums text-base aria-invalid:border-danger"
          placeholder="Hex, rgb(), hsl() or oklch()"
        />
      </div>
      <Button onClick={onShuffle} title="Random color (Space)" className="mt-3 h-12 w-full">
        <Shuffle className="size-4" aria-hidden /> Random colors
        <kbd className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">Spacebar</kbd>
      </Button>
      <p id={`${id}-hint`} className={invalid ? "mt-1.5 text-xs text-danger" : "mt-1.5 text-xs text-muted"}>
        {invalid ? "Not a valid color. Try #3b82f6, rgb(59 130 246), hsl(217 91% 60%) or oklch(62% 0.2 260)." : `${named.family} · nearest named color ${named.specific}. You can paste a Tailwind config or @theme block.`}
      </p>
    </div>
  );
}
