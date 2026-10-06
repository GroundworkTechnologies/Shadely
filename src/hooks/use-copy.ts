"use client";

import { useCallback, useRef, useState } from "react";

/** Copy text and expose a short-lived message for a live region. */
export function useCopy() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} ${text.length > 40 ? "" : text}`.trim());
    } catch {
      setMessage("Copy failed. Select the text and copy manually.");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 2200);
  }, []);

  return { copy, message };
}
