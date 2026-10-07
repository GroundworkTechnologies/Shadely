# 03 — Tailwind compatibility & export formats

Sample palette named `brand`, base `#3b82f6`. Values below are illustrative.

## 1. Tailwind v4 — CSS-first (`@theme`)

```css
@import "tailwindcss";

@theme {
  --color-brand-50:  oklch(97% 0.014 255);
  --color-brand-100: oklch(93.2% 0.032 255.6);
  /* … 200–900 … */
  --color-brand-950: oklch(28.2% 0.091 267.9);
}
```
- Generates `bg-brand-500`, `text-brand-700`, `ring-brand-400/50`, etc.
- Options Shadely exposes: `@theme` (default) vs `@theme inline` (when values reference other vars, e.g. dark-mode semantic tokens), and an optional `--color-*: initial;` line to drop the default palette.
- Semantic layer (v2): `:root { --primary: var(--color-brand-600) }` + `.dark { … }` + `@theme inline { --color-primary: var(--primary) }`, which is the shadcn/ui convention.
- Value format choices: `oklch()` (default; lossless), hex, hsl, rgb, and `color(display-p3 …)` with sRGB fallback.
- Number formatting: L as percent, C 3 decimals, H 1–3 decimals, trailing zeros trimmed — same style as Tailwind's own theme.

## 2. Tailwind v3 — `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          /* … */
          950: '#172554',
        },
      },
    },
  },
};
```
Variants to offer: CommonJS / ESM / TS (`satisfies Config`), `extend` vs replace, and **alpha-aware CSS vars** form for opacity modifiers:
```js
brand: { 500: 'rgb(var(--brand-500) / <alpha-value>)' }
```
with `:root { --brand-500: 59 130 246; }`. v3 does not parse `oklch()` for opacity modifiers reliably across the whole pipeline, so v3 export defaults to **hex**.

## 3. Other formats

| Format | Shape | Notes |
|---|---|---|
| **CSS variables** | `:root { --brand-50: #…; }` | Choose prefix (`--color-` / none), color syntax, optional `.dark` block |
| **SCSS** | variables `$brand-50: #…;` and a map `$brand: (50: #…, …);` | Also a `@each` helper snippet |
| **JSON (flat)** | `{ "brand": { "50": "#…", … } }` | Includes optional `oklch` and `contrast` per stop |
| **Design tokens (DTCG)** | `{ "brand": { "50": { "$type": "color", "$value": … } } }` | W3C Design Tokens Format (stable 2025.10) supports structured colors: `{ "colorSpace": "oklch", "components": [L, C, H], "hex": "#…" }`. **Verify against current spec before building.** |
| **Tokens Studio / Figma** | Same DTCG-like JSON; Tokens Studio uses `value`/`type` (legacy) or `$value`/`$type` | Offer both toggles. Figma Variables import is via Tokens Studio or plugin, not raw JSON paste. |
| **Figma styles plugin** | later | Needs a plugin; defer |
| **Image/SVG** | palette strip PNG/SVG | v2 |
| **Plain list** | CSV `name,hex,oklch` | for spreadsheets |

## 4. Naming and structure rules
- Stops fixed: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.
- Names: kebab-case, validated against `[a-z][a-z0-9-]*`; reject collisions with Tailwind reserved color names unless the user opts in (warn, don't block).
- Multi-palette export (brand + neutral + success/warning/danger/info) as one file.
- Every export is deterministic and round-trippable: the output embeds a header comment with the Shadely share URL so it can be regenerated.

## 5. Tailwind default palettes
Shadely ships the full default v3 and v4 palettes as static data (for the reference page, "start from Tailwind color" and comparisons). v4.2 added `mauve`, `olive`, `mist`, `taupe`. Source of truth should be generated from the official `tailwindcss` package at build time (dev dependency) to avoid hand-copied values.
