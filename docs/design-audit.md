# Design audit (before the refinement pass)

Measured with `grep` over `src/` on 2026-10-06. Scope: app chrome and all 11 preview pages. The color engine is out of scope and unchanged.

## 1. Findings

| Area | Current state | Problem |
|---|---|---|
| Typefaces | Geist Sans + Geist Mono (two families). `font-mono` in 13 places; Tailwind preflight also forces a monospace stack on `code`, `kbd`, `pre`. OG images use Satori's built-in fallback font. | Brief: Manrope only, everywhere. |
| Font weights | 74 `font-medium`, **46 `font-semibold`**, **5 `font-bold`**, 5 `font-normal`. Browser defaults add bold to `strong` and `th`. OG images set `fontWeight: 700`. | Brief (updated): only regular 400, medium 500, semibold 600. Nothing lighter or heavier. Semibold is overused as a default emphasis; large headings are bold/semibold instead of light. |
| Radii | 9+ distinct values: `rounded-md` 39, `-full` 30, `-2xl` 25, `-xl` 12, `-lg` 11, `-3xl` 11, `-sm`, `rounded`, `[3px]`, `[2.5rem]`. Controls use md (6px); panels use 2xl (16px); preview cards use 3xl (24px). | Brief: one radius family, 8 to 12 px. |
| Shadows | `shadow-sm` ×4, `shadow-xs`, `shadow-md`, `shadow-lg` (toast, popover-like cards). | Brief: 1px borders over shadows. Keep one elevation for floating UI only. |
| Type sizes | Scale is fine (xs/sm/base…) but 8× `text-[11px]`, 2× `text-[10px]`, 1× `text-[13px]` are ad hoc. Heading tracking is set per element (`tracking-tight` ×17); `tracking-widest` ×3 on micro labels. | Sub-12px text is hard to read. Tracking should come from the type tokens, not each element. |
| Line heights | Tailwind defaults (1.5, 1.33, 1.2…) | Fine for body; large headings need ~1.1 to 1.2. |
| Chrome color | Warm-stone tinted neutral (`#fafaf9` page, tinted borders), teal-green accent used for primary buttons, sliders, checkboxes, link/skip-link, selection. | Brief: neutral, mostly white; palettes are the only strong color. Teal in the chrome competes with the user's palette. |
| Primary action | Teal fill. | Should be neutral (near-black / near-white) so it never clashes with a generated color. |
| Focus ring | Teal 2px. | Should be neutral and clearly visible in both modes. |
| Control sizes | `h-9` everywhere except the color row (`h-10`) and a few `size-9` icon buttons. | Mostly consistent; the color row is the one deliberate exception (primary field). |
| Spacing | Panels mix `p-4`, `p-5`, `p-6`; gaps mix 3/4/6. | Needs one rhythm: 4 px grid; panels `p-5`; section gap 24 px. |
| Icons | `lucide-react` only (one set), default 2 px stroke. | Too heavy; use a thin 1.5 px stroke. |
| Hard-coded colors | `#fafaf9`, `#696761`, `#51504b`, `#1f1f1c` in OG images; `red-600/700/400` for validation text. | OG colors should match tokens; validation red should be a token. |
| Transitions | `transition-colors` default (150 ms) on some buttons, none on inputs/tabs. | Add one transition rule for interactive elements (150 ms). |
| Preview internals | Cards at `rounded-3xl`/`2xl`, bold wordmarks, mono hex strings. | Normalise radius and weight; wordmarks may use 600 (they are brand marks). |

## 2. Decisions

1. **One family, Manrope**, weights 400/500/600 via `next/font/google`. `--font-mono` is aliased to Manrope so nothing can fall back to a monospace face; numeric alignment uses `tabular-nums`. `strong`, `b`, `th` default weights are reset to 500/600 in base CSS.
2. **Weights by role:** display and large headings (≥ 24 px) 400 with tighter tracking; body 400; labels, buttons, nav, panel titles 500; 600 only for brand wordmarks. Nothing lighter than 400 or heavier than 600.
3. **Tracking from tokens:** `--text-*--letter-spacing` on `2xl` and up (-0.01em to -0.025em); per-element `tracking-tight` removed.
4. **Radius tokens:** `--radius-control` 8 px (buttons, inputs, tabs, tiles), `--radius-card` 12 px (panels, preview cards). Pills and avatars stay fully round; phone frames keep their device radius.
5. **Neutral chrome:** pure gray (chroma 0) generated with the Shadely engine, white page in light, near-black (≈ #111) in dark. Primary action is near-black (light) / near-white (dark).
6. **Borders:** panels, dividers, secondary buttons use a subtle 1 px border (decorative, text identifies the control). **Form fields, checkboxes and range tracks use a control border at ≥ 3:1** (WCAG 1.4.11), so low-contrast styling never costs accessibility.
7. **Elevation:** none, except one `--shadow-float` for the toast.
8. **Icons:** lucide, stroke 1.5 px, enforced in base CSS.
9. **Contrast guard:** a unit test parses the tokens in `globals.css` and fails the build if any text/background pair is below 4.5:1 or any control border below 3:1, in light and dark.
10. **Exceptions kept on purpose:** the base-color row is 40 px tall (primary field); Shadely's logo keeps a small teal accent (it is a brand mark, not UI chrome); the 11 previews keep their own illustrative colors, driven by the user's palette.

## 3. Outcome

- Manrope 400/500/600 is the only face in the app and in generated OG images (WOFF files in `src/assets/fonts`, SIL OFL licence alongside). A test fails the build if any other weight class or typeface appears.
- Chrome is neutral: pure gray tokens, near-black primary action, neutral focus ring. Only generated palettes (and the small logo mark) carry color.
- Radius is 8 px (controls) and 12 px (cards); one floating shadow; icons at 1.5 px stroke; 150 ms transitions.
- Contrast: `src/lib/__tests__/design-tokens.test.ts` checks every text/background pair at 4.5:1 and control borders and focus ring at 3:1, light and dark.
- Responsive: header, content and footer share one container (`page-container`); previews use container queries so they adapt to the preview panel, not the viewport.

Next candidates: a visual regression suite (Playwright screenshots per tab and breakpoint), an axe pass in CI, and an optional "auto" palette name that follows the color name.
