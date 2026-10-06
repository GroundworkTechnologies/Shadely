"use client";

import { createContext, useContext } from "react";
import type { NamedScale, PreviewTheme } from "@/engine";

interface PreviewContextValue {
  /** Brand palette name, used in class-name snippets. */
  name: string;
  theme: PreviewTheme;
  scales: NamedScale[];
  onExportShadcn: () => void;
}

export const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreview(): PreviewContextValue {
  const v = useContext(PreviewContext);
  if (!v) throw new Error("usePreview must be used inside <Preview>");
  return v;
}
