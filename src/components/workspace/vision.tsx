"use client";

import { VISION_LABELS, VISION_MODES, visionFilterValues, type VisionMode } from "@/engine";

/** Hidden SVG filters that simulate color-vision deficiencies (applied with CSS `filter: url(#…)`). */
export function VisionFilters() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" className="absolute">
      <defs>
        {VISION_MODES.filter((m) => m !== "normal").map((m) => (
          <filter key={m} id={`tw-vision-${m}`} colorInterpolationFilters="linearRGB">
            <feColorMatrix type="matrix" values={visionFilterValues(m)} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

export const visionStyle = (mode: VisionMode): React.CSSProperties | undefined => (mode === "normal" ? undefined : { filter: `url(#tw-vision-${mode})` });

export function VisionSelect({ value, onChange }: { value: VisionMode; onChange: (m: VisionMode) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Vision</span>
      <select value={value} onChange={(e) => onChange(e.target.value as VisionMode)} className="h-9 rounded-control border border-control bg-surface px-2">
        {VISION_MODES.map((m) => (
          <option key={m} value={m}>
            {VISION_LABELS[m]}
          </option>
        ))}
      </select>
    </label>
  );
}
