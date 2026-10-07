"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

/** Large dialog on the native <dialog> element: focus trap, Escape and backdrop come for free. */
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[92dvh] w-[min(72rem,calc(100vw-1.5rem))] overflow-y-auto rounded-card border border-border bg-surface p-0 text-foreground shadow-float backdrop:bg-black/40"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <h2 className="text-base font-medium">{title}</h2>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="inline-flex size-9 items-center justify-center rounded-control text-muted hover:bg-surface-hover hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {open && <div className="[&_section]:rounded-none [&_section]:border-0">{children}</div>}
    </dialog>
  );
}
