"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts its children only when the section nears the viewport, so heavy panels
 * stay out of the first-load JavaScript. The wrapper owns the anchor id and reserves
 * space, so in-page links work before the content has loaded.
 */
export function LazySection({ id, minHeight, children, forceOpen }: { id: string; minHeight: number; children: React.ReactNode; forceOpen?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} id={id} className="scroll-mt-4" style={visible || forceOpen ? undefined : { minHeight }}>
      {(visible || forceOpen) && children}
    </div>
  );
}
