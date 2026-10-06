# 04 — Competitors

Sources: tool sites and third-party roundups found via web search on 2026-10-06; cells marked `?` are not verified and need a manual check before publishing any comparison.

| Tool | Core idea | Color space | Base color placement | Exports | Contrast | Live UI preview | Share / save | Image/AI | Price |
|---|---|---|---|---|---|---|---|---|---|
| **UI Colors** (uicolors.app) | Brand/neutral/status scales + harmony + big preview gallery | HSL scale (API), OKLCH display | pinned to 500 | hex/HSL/OKLCH, Tailwind snippets, Figma plugin, paid API | WCAG 2 + APCA toggle, per shade | **Yes — 11 tabs** | account-gated | No | Free tier + Pro; paid API |
| **Tints.dev** (Simeon Griggs) | Single-purpose 11-stop generator + open API | OKLCH/HSL; "linear vs perceived" mode | anchored; sliders for hue/sat shifts and lightness min/max | oklch, hex, hsl, p3; v3 and v4 formatting | graph of lightness; no matrix `?` | No | URL params, multi-palette via query | No | Free, open source |
| **Realtime Colors** | Live preview of 5 role colors on a landing page | HSL-ish | n/a (roles, not scales) | Tailwind config, CSS vars | basic | **Yes — single sample page** | share URL | No | Free |
| **Coolors** | Palette exploration, lock, spacebar | HSB | n/a | many (PDF, image, code) | contrast checker tool | limited visualizer | accounts | Image extract | Free + Pro |
| **Shader** (AI Tailwind palette gen) | Palette from a base color, "perceptual" | OKLCH `?` | `?` | Tailwind | `?` | `?` | `?` | "AI-powered" label | `?` |
| **Radix Colors / Leonardo (Adobe)** | Contrast-driven scale generation: pick target contrast ratios, tool finds colors | CIECAM02/LCH/OKLCH | contrast-targeted | JSON, CSS | **Core feature** | minimal | share | No | Free |
| **oklch.com** (Evil Martians) | OKLCH picker with P3/sRGB gamut visualization | OKLCH | n/a | CSS | no | no | URL | No | Free |

## Takeaways
1. **Preview-rich tools** (UI Colors, Realtime Colors) lack rigorous contrast; **rigorous tools** (Leonardo, Radix) lack friendly previews and Tailwind-native output. Nobody does both well.
2. **Tints.dev** is the open-source benchmark for correctness and exports; it is minimal on accessibility and previews.
3. **Pro-gating** of secondary/neutral/status scales (UI Colors) is the most visible friction.
4. **URL-as-state** is only half-done by most (Tints.dev is closest).
5. **Image/logo → palette** exists in Coolors (palette only, not 50–950 scales). Combining it with scale generation is open.
6. Nobody (verified) ships a **pairing matrix**, **dark-mode semantic mapping**, or **color-blind simulation** inside the same flow as Tailwind export.
