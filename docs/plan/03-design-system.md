# Phase 2 — Plan (part 3): design system

Direction: **calm, precise, workshop-like** — a tool that feels like a well-made instrument. Neutral canvas so the user's colors are the loudest thing on screen. Tintwork's own accent is generated *by Tintwork* (dogfooding).

## 1. Color
Defined as Tailwind v4 `@theme` tokens in `globals.css`, with semantic aliases switched by `.dark` / `prefers-color-scheme`.

| Role | Light | Dark |
|---|---|---|
| `--background` | neutral-50 (warm stone, `oklch(98.5% 0.003 95)`) | neutral-950 (`oklch(16% 0.008 95)`) |
| `--surface` (cards/panels) | white | neutral-900 |
| `--surface-muted` | neutral-100 | neutral-800 |
| `--border` | neutral-200 | neutral-800 / 700 |
| `--foreground` | neutral-900 | neutral-50 |
| `--muted-foreground` | neutral-600 (≥ 4.5:1 on background) | neutral-400 |
| `--accent` (primary actions, focus) | accent-600 | accent-400 |
| `--accent-foreground` | white | accent-950 |
| `--ring` | accent-500, 2 px + 2 px offset | same |
| Status | success/warning/danger/info from generated status scales, 700 text on 50 bg (light), 300 on 950 (dark) |

Accent base (default, pending your brand): teal-green `#2f8f6b`. The scales for accent + neutral are produced by our own engine at design time and checked in as tokens (then verified by a test that regenerates and compares).
Rule: color is never the only signal (icon + text for status and pass/fail).

## 2. Typography
- **Geist Sans** (UI, headings with tighter tracking and weight 600) and **Geist Mono** (hex/oklch values, code), via `next/font` (self-hosted).
- Scale (rem): 12 / 14 / 16 / 18 / 20 / 24 / 30 / 40 / 56. Body 16, UI controls 14, values in mono 13 with `font-variant-numeric: tabular-nums`.
- Line heights 1.5 body, 1.2 headings. Max line length 68ch for prose.

## 3. Spacing, radius, elevation, motion
- 4 px base grid (`--spacing: .25rem`); layout rhythm 8/12/16/24/32/48.
- Radius: 6 (inputs/chips), 10 (cards), 16 (preview frame), full (swatch dots). Swatches in the scale strip are square-cornered at joins, rounded at ends.
- Borders over shadows; one shadow level for popovers (`0 8px 24px oklch(0 0 0 / .12)`).
- Motion: 120–180 ms ease-out for hover/copy feedback; no motion on scale changes beyond color transition (≤ 150 ms); respect `prefers-reduced-motion`.
- Container 1280 px; workspace uses a two-pane layout ≥ 1024 px (controls + scales | preview), single column below, with sticky bottom bar for Export on mobile.

## 4. Layout of the workspace
```
┌ Header: Tintwork · Generate · Saved · Tailwind colors · theme · GitHub?        ┐
│ ┌ Controls (left, 360px) ────────┐ ┌ Preview (right, flexible) ──────────────┐ │
│ │ Base color [#______] [picker] ⟳ │ │ [Light|Dark] [Vision: normal ▾]         │ │
│ │ Palettes: Brand · Neutral · Status│ │ ┌ Landing ┐ Dashboard Form Charts ┐   │ │
│ │ Scale strip 50…950 (click=copy) │ │ │  real components themed by vars    │   │ │
│ │ Tuning: L range · Chroma · Hue  │ │ └────────────────────────────────────┘   │ │
│ │ Contrast: [WCAG|APCA] chips     │ │ Pairing matrix (collapsible)             │ │
│ │ [Export ▸] [Share link] [Save]  │ │                                          │ │
│ └─────────────────────────────────┘ └──────────────────────────────────────────┘ │
│ Footer: A Groundwork Technologies product · groundwork.co.ke · Privacy · About   │
```

## 5. Components (MVP)
Button (primary/secondary/ghost/destructive, sm/md/lg, icon), IconButton, Input, ColorInput (hex field + native picker + validation message), Slider (labelled, numeric readout, keyboard steps), Tabs, Segmented control, Switch, Select/Dropdown, Dialog (Export), Tooltip, Toast/live-region ("Copied"), Badge (AA/AAA/Fail, with icon), Card, CodeBlock (copy, line-wrap, format tabs), Swatch / ScaleStrip, ContrastChip, PairingMatrix (grid with `role="grid"`, cell labels "bg 100 / fg 700: 9.4:1 AAA"), Kbd.

## 6. Preview components (themed by CSS variables)
Navbar, hero with CTA, buttons (all states), form (input, select, checkbox, radio, switch, error/success), alert set (4 statuses), badges/tags, cards, pricing card, data table, tabs, toast, tooltip, line + bar + donut SVG charts (categorical series from brand/accent/status), focus-ring demo. Preview wrapper sets `--brand-50…950`, `--neutral-…`, `--success-…` etc.; components use only those via Tailwind arbitrary-free tokens (`bg-brand-600`) because the preview subtree defines `--color-brand-*` locally.

## 7. Light/dark
- Three-state theme control (system/light/dark), persisted in localStorage; inline pre-hydration script avoids flash; `color-scheme` set.
- **App theme and preview theme are independent**: the preview has its own Light/Dark toggle so users can test both without changing the tool UI.

## 8. Accessibility checklist baked into the system
Visible focus on every interactive element; target size ≥ 24×24 (prefer 36+); contrast tokens verified by a unit test that fails the build if any semantic text/background pair < 4.5:1; swatch buttons have accessible names ("brand 500, #3b82f6, copy"); sliders have `aria-valuetext`.
