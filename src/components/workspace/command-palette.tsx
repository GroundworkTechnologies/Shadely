"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

/** Cmd/Ctrl+K command palette on a native dialog (focus trap and Escape come for free). */
export function CommandPalette({ commands, open, onClose }: { commands: Command[]; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const words = q.split(/\s+/);
    return commands.filter((c) => words.every((w) => `${c.group} ${c.label}`.toLowerCase().includes(w)));
  }, [commands, query]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    // Let the dialog close (and return focus) before the command moves focus elsewhere.
    setTimeout(c.run, 0);
  };

  return (
    <dialog
      ref={ref}
      aria-label="Command palette"
      onClose={() => {
        setQuery("");
        setActive(0);
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-card border border-border bg-surface p-0 text-foreground shadow-float backdrop:bg-black/40"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active]!.id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(results.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(results[active]);
            }
          }}
          className="h-12 flex-1 bg-transparent outline-none"
        />
        <kbd className="rounded border border-border px-1.5 text-xs text-muted">Esc</kbd>
      </div>
      <ul id={listId} role="listbox" aria-label="Commands" className="max-h-80 overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matching commands</li>}
        {results.map((c, i) => (
          <li
            key={c.id}
            id={`${listId}-${c.id}`}
            role="option"
            aria-selected={i === active}
            onMouseMove={() => setActive(i)}
            onClick={() => run(c)}
            ref={(el) => {
              if (el && i === active) el.scrollIntoView({ block: "nearest" });
            }}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2 text-sm ${i === active ? "bg-surface-hover" : ""}`}
          >
            <span>
              <span className="text-muted">{c.group} · </span>
              {c.label}
            </span>
            {c.hint && <kbd className="rounded border border-border px-1.5 text-xs text-muted">{c.hint}</kbd>}
          </li>
        ))}
      </ul>
    </dialog>
  );
}
