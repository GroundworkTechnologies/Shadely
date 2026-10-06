"use client";

import { useCallback, useState } from "react";

interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** Time of the last recorded change, used to merge rapid edits (slider drags) into one step. */
  at: number;
}

/** State with undo and redo. Changes made within `mergeMs` of each other become one undo step. */
export function useHistory<T>(initial: T, { mergeMs = 600, limit = 100 } = {}) {
  const [h, setH] = useState<History<T>>({ past: [], present: initial, future: [], at: 0 });

  const set = useCallback(
    (update: (prev: T) => T) =>
      setH((cur) => {
        const next = update(cur.present);
        if (next === cur.present) return cur;
        const now = Date.now();
        const merge = cur.past.length > 0 && now - cur.at < mergeMs;
        return { past: merge ? cur.past : [...cur.past, cur.present].slice(-limit), present: next, future: [], at: now };
      }),
    [mergeMs, limit],
  );

  const undo = useCallback(
    () =>
      setH((cur) => {
        if (!cur.past.length) return cur;
        const previous = cur.past[cur.past.length - 1]!;
        return { past: cur.past.slice(0, -1), present: previous, future: [cur.present, ...cur.future], at: 0 };
      }),
    [],
  );

  const redo = useCallback(
    () =>
      setH((cur) => {
        if (!cur.future.length) return cur;
        const [next, ...rest] = cur.future;
        return { past: [...cur.past, cur.present], present: next!, future: rest, at: 0 };
      }),
    [],
  );

  return { state: h.present, set, undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}
