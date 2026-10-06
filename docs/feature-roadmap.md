# Tintwork feature roadmap

Status: proposal, nothing here is built yet. Current design, fonts and color engine stay as they are.

## How to read this

- **Built** and **Partial** mark what already exists in the app today, so nothing is proposed twice.
- **Effort:** S = days, M = 1 to 2 weeks, L = a month or more (relative sizing for one developer, not a commitment).
- **Priority:** Must = clearly improves the core promise; Should = strong value; Nice = polish or later.
- **Tier:** Free or Pro. Principle: **the core tool stays free and account-free**. We never gate the things uicolors.app gates (secondary, neutral and status scales, saving). Pro is for things that cost us money to run or serve teams: cloud sync, AI, server-side extraction, API quota, Figma and CI integrations, branded outputs.
- **"Beats" claims** are based on my teardown of uicolors.app (`docs/research/01-reference-teardown.md`, read from its HTML and JS, not a full click-through). Claims about other tools are weaker and marked *(verify)*.

## What is already built (baseline)

OKLCH scale engine with the base color anchored at its natural stop; chroma, hue and lightness-range tuning; brand, neutral and four status scales; WCAG 2.2 and APCA contrast per shade plus an 11x11 pairing matrix; real color names; 11 live preview pages in light and dark; exports for Tailwind v4, Tailwind v3 (ESM, CJS, TS), CSS variables, SCSS, JSON, DTCG, Tokens Studio and a shadcn/ui theme with AA-guaranteed semantic tokens; share links (all state in the URL); local saved palettes with backup and import; Tailwind default color reference; per-palette OG images; responsive, keyboard-accessible UI; 130 tests.

---

## The 5 features that make Tintwork clearly unique

1. **Contrast-first scales with auto-fix** (1.4, 2.4). Say "every 600 must pass AA on white, every 100 must pass AA with 900" and Tintwork builds and repairs the scale to meet it, changing the minimum amount. uicolors.app shows contrast per shade; Leonardo does contrast-driven generation but has no Tailwind output or previews. Nobody combines all three.
2. **Complete semantic tokens for light and dark, exported to every platform** (1.9, 5.x). One palette becomes `background / surface / text / border / primary / ring` for light and dark with AA guaranteed, then exports to shadcn (built), Tailwind v4, Flutter, iOS, Android and Style Dictionary. No competitor does design-to-platform tokens from one color.
3. **Import and migrate** (6.4, 6.5). Paste your existing `tailwind.config.js`, `@theme` block or token JSON. Tintwork shows how it differs from a perceptually even scale, contrast failures per pair, and offers a regenerated version side by side. This is the adoption lever for teams that already have a palette.
4. **Palette as code** (7.1 to 7.5). A published zero-dependency engine, `npx tintwork` CLI, REST API, an MCP server for AI coding agents, and a GitHub Action that fails a pull request when brand colors stop meeting contrast. uicolors.app offers a paid API with terms that forbid competing tools; we ship open tooling.
5. **Local-first with regional reach** (3.2, 8.5, 8.2). Logo and image color extraction that never leaves the browser, offline PWA, and an interface in English, Somali, Swahili and Arabic (with right-to-left). Privacy and language are real gaps for East Africa and the Gulf, and a natural fit for Groundwork Technologies.

Honorable mentions: color-vision simulation across the whole preview (2.3), a custom curve editor with lock and edit per shade (1.2, 1.3), and "live on your own site" injection (4.2).

---

## 1. Color generation

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 1.1 | **OKLCH scales, anchored base** (built) | uicolors.app pins to 500 in an HSL-derived scale | Everyone | Done | Done | Free |
| 1.2 | **Custom curve editor.** Drag lightness and chroma curves on a graph, per stop, with the Tailwind v4 reference curve as a ghost line. Presets: "Tailwind-like", "Flat", "High contrast" | uicolors.app has no curve control; tints.dev has sliders only | Designers who want a house style | M | Should | Free; saved curve presets Pro |
| 1.3 | **Lock and edit individual shades.** Type a hex for any stop, lock it, and the rest of the scale re-flows around it. Overrides are stored in the URL | Common ask in this tool class; uicolors.app allows manual edits but not re-flow *(verify)* | Brand teams with fixed brand hexes | M | Must | Free |
| 1.4 | **Contrast-targeted generation.** Per-stop targets ("600 ≥ 4.5 on white", "100 vs 900 ≥ 7") solved in OKLCH | Leonardo only; no Tailwind or previews | Accessibility-driven teams | M | Must | Free |
| 1.5 | **Anchor stop control** (engine ready). Choose which stop your base color lands on, or "auto" | uicolors.app always 500 | Anyone with a yellow or navy brand color | S | Should | Free |
| 1.6 | **Harmony accent and secondary scales** (partial: only status hues exist). Analogous, complementary, split, triadic, tetradic, square; each with its own scale and an editable hue offset | uicolors.app gates secondary scales behind Pro | Brands needing 2 to 3 colors | M | Must | Free |
| 1.7 | **Neutral pairing.** Tinted neutral is built; add a tint-amount slider and "use Tailwind's slate, gray, zinc, stone, taupe, mauve, mist or olive" | uicolors.app neutral is Pro-gated | Everyone | S | Should | Free |
| 1.8 | **Natural hue shift preset.** Lights drift toward yellow, darks toward blue (Bezold-Brücke) so scales look hand-tuned | Not seen elsewhere *(verify)* | Designers | S | Nice | Free |
| 1.9 | **Dark-mode scale and semantic layer.** Generate a dark-optimized mapping (lower chroma, adjusted lightness) and `background / surface / text / border / ring` tokens for both modes with AA guaranteed (shadcn version built) | Nobody ships this with Tailwind output | Product teams shipping dark mode | M | Must | Free |
| 1.10 | **P3 mode UI.** Toggle sRGB or Display-P3, gamut-boundary visual, "clipped" badge, `@media (color-gamut: p3)` export with sRGB fallback (engine ready) | tints.dev has p3 output only | Designers on modern displays | M | Should | Free |
| 1.11 | **Perceptual gradients.** OKLCH-interpolated gradients without muddy gray midpoints, with Tailwind and CSS output (previews exist; no tool yet) | Gradient tools rarely tie to your palette | Marketing and brand teams | M | Should | Free |
| 1.12 | **Data-visualization palettes.** Categorical (color-vision-safe), sequential and diverging sets derived from the brand | uicolors.app previews charts but does not generate chart palettes | Dashboard builders | M | Should | Free basics; advanced Pro |
| 1.13 | **Alpha and tint scales.** Transparent variants (`brand-500/10…/90`) as ready tokens | Rare | Developers | S | Nice | Free |
| 1.14 | **Custom stops.** 9, 11, 12 or extra stops (25, 750, 850) | tints.dev fixed to 11 | Design-system authors | M | Nice | Pro |
| 1.15 | **Closest Tailwind color.** Show the nearest default Tailwind color per shade and the distance | Unique convenience | Migrators | S | Nice | Free |

## 2. Accessibility

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 2.1 | **WCAG 2.2 and APCA matrix** (built) with pass/fail per pair | uicolors.app: per-shade only, white background | Everyone | Done | Done | Free |
| 2.2 | **Policy-aware pass/fail.** Choose text size and weight (body, large, UI, non-text) and standard (AA, AAA, APCA Lc tiers); badges adapt. Non-text 3:1 check for borders and focus rings | Competitors show one threshold | Accessibility leads | S | Should | Free |
| 2.3 | **Color-vision simulation.** Protanopia, deuteranopia, tritanopia, achromatopsia across the scale and every preview page, plus a status-color distinguishability check (are success and danger separable?) | Absent in uicolors.app *(verify others)* | Designers, QA | M | Must | Free |
| 2.4 | **Auto-fix.** Click a failing pair; Tintwork nudges lightness (keeping hue and chroma) to the nearest passing value and shows the change | Nobody | Developers who just want it to pass | M | Must | Free |
| 2.5 | **Accessible text picker per shade.** Built: best of white or black. Extend to palette-aware picks (for example `brand-900` on `brand-100`) with ratio and copyable class | uicolors.app suggests usage hints only | Everyone | S | Must | Free |
| 2.6 | **Accessibility report.** One-page PDF, markdown or JSON: every pair, results, remediation, standard and date | Nobody | Agencies, procurement | M | Should | Pro |
| 2.7 | **Forced-colors and low-vision previews.** Windows high contrast, 200% zoom and reduced-transparency views of the preview | Nobody | Accessibility teams | M | Nice | Free |
| 2.8 | **Contrast on images and gradients.** Sample under text and warn | Rare | Marketing designers | M | Nice | Pro |

## 3. Brand tools

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 3.1 | **Full brand set** (partial: brand, neutral, 4 status built). Add secondary, accent, and user-defined extra scales (add, rename, remove, reorder) | uicolors.app gates these | Brand teams | M | Must | Free |
| 3.2 | **Extract from logo or image.** Client-side dominant colors (median cut in OKLab), SVG fill parsing, eyedropper; pick one and generate. No upload | Coolors extracts palettes but not Tailwind scales; privacy is a plus | Founders with a logo | M | Must | Free |
| 3.3 | **Extract from a URL.** Server fetches a page, reads CSS variables, `theme-color`, logo and favicon, returns candidate brand colors. Needs SSRF protection, rate limiting, timeouts | Nobody offers this with scale generation *(verify)* | Agencies rebranding client sites | L | Should | Pro |
| 3.4 | **AI suggestions from a prompt or industry** ("calm fintech for farmers"). The model proposes 3 to 5 base colors with rationale; the engine validates contrast and generates scales. Prompts are not stored | uicolors.app has none; Shader markets AI *(verify)* | Non-designers | L | Should | Pro (free curated industry presets) |
| 3.5 | **Role mapping editor.** Map stops to roles (primary, hover, active, disabled, border, text) with live AA guard | Nobody | Design-system teams | M | Should | Free |
| 3.6 | **Preset library.** Curated palettes by industry and mood, Tailwind-ready, searchable by color name | Coolors has libraries but no scales | Beginners | M | Should | Free |
| 3.7 | **Localized color names** (Somali, Swahili, Arabic alongside English) | Nobody | Regional users | S | Nice | Free |
| 3.8 | **Logo contrast checks.** Test the logo on every background in the palette | Rare | Brand managers | M | Nice | Pro |

## 4. Preview

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 4.1 | **11 preview pages, light and dark** (built) | Realtime Colors has one page; tints.dev none | Everyone | Done | Done | Free |
| 4.2 | **Live on your own site.** A one-line script, bookmarklet or `npx tintwork dev` overlay injects the palette as CSS variables into your running Tailwind v4 site. Cross-origin iframes cannot be recolored, so a proxy is not the answer | Nobody | Developers | L | Should | Free for localhost; hosted shareable previews Pro |
| 4.3 | **Email preview.** Table-based, inline-hex email with dark-mode behavior | Nobody | Marketers | M | Should | Free |
| 4.4 | **Paste your own markup.** Sandboxed iframe renders your HTML/Tailwind with the palette | Nobody | Developers | L | Nice | Free |
| 4.5 | **Responsive device frames and side-by-side light and dark** | Nobody | Designers | S | Should | Free |
| 4.6 | **More page types.** E-commerce, blog, docs, onboarding, admin, pricing | uicolors.app has 11 tabs, comparable | Everyone | M | Nice | Free |
| 4.7 | **Preview in color-vision modes** (uses 2.3) | Nobody | Accessibility | S | Must | Free |

## 5. Export

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 5.1 | **Tailwind v4, v3, CSS, SCSS, JSON, DTCG, Tokens Studio, shadcn** (built) | uicolors.app: Tailwind snippets, hex/HSL/OKLCH, no DTCG or shadcn theme from the same tool *(verify its shadcn tool is separate)* | Everyone | Done | Done | Free |
| 5.2 | **Download all as ZIP** with a README. Dependency-free zip writer | Nobody bundles | Everyone | S | Must | Free |
| 5.3 | **Style Dictionary** config and tokens (v4 format) | Nobody | Design-system teams | S | Should | Free |
| 5.4 | **Flutter.** `ColorScheme`, `ThemeData` and `MaterialColor` swatches in Dart; Material 3 tonal alignment as stretch | Nobody | Flutter teams (Groundwork builds these) | S | Should | Free |
| 5.5 | **iOS and Android.** Asset catalog `colorset` JSON with light, dark and P3; SwiftUI `Color` extension; `colors.xml`; Jetpack Compose `Color.kt` | Nobody | Mobile teams | M | Should | Free |
| 5.6 | **UI-library themes.** MUI `createTheme`, Mantine 10-shade arrays, Chakra, React Native | Nobody | App developers | M | Nice | Free |
| 5.7 | **Modern CSS output.** `light-dark()`, `@supports` OKLCH with hex fallback, `@property` | Rare | Front-end engineers | S | Should | Free |
| 5.8 | **Figma variables sync** (see 7.4) | uicolors.app has a Figma plugin | Designers | L | Should | Pro |
| 5.9 | **Remembered export profile and diff-friendly output** (stable ordering, header with share link, built) | Nobody | Teams | S | Nice | Free |

## 6. Workflow

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 6.1 | **Share links and local saved palettes** (built; no account) | uicolors.app saves behind sign-in *(inferred)* | Everyone | Done | Done | Free |
| 6.2 | **Undo, redo and history timeline.** State is a small object; step through changes and restore | Rare | Everyone | S | Must | Free |
| 6.3 | **Projects.** Group palettes, add notes and versions, export a project file | Nobody | Agencies | M | Should | Free local; synced Pro |
| 6.4 | **Import existing config.** Parse `tailwind.config.js`, `@theme` CSS, token JSON, hex lists, Figma tokens; show the scale as-is, with its contrast problems | Nobody | Teams with an existing palette | M | Must | Free |
| 6.5 | **Compare palettes.** A/B or against Tailwind defaults: ΔE per stop, contrast changes, split preview | Nobody | Reviewers, rebrands | M | Should | Free |
| 6.6 | **Short share links with previews** (`/p/abc123`) on top of the long URL; needs storage | Nice for chat apps | Everyone | M | Nice | Free; permanent links Pro |
| 6.7 | **Optional account and cloud sync.** Passkey sign-in, local-first, conflict-safe | uicolors.app requires accounts for basics | Multi-device users | L | Nice | Pro |
| 6.8 | **Team libraries and comments** | Rare | Teams | L | Nice | Pro (Team) |

## 7. Integrations

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 7.1 | **Published engine package + CLI.** `@groundwork/tintwork-engine` (zero dependencies) and `npx tintwork generate #505cc6 --format v4`, `check` (contrast gate), `import` | uicolors.app API terms forbid competing tools | Developers, CI | M | Must | Free |
| 7.2 | **Public REST API with OpenAPI.** Scale, contrast, name, export; CORS; free rate-limited tier | uicolors.app API is paid-only | Tool builders | M | Should | Free tier; keys Pro |
| 7.3 | **MCP server** so AI coding agents (Claude Code and others) can generate and validate palettes | Nobody | Developers using AI tools | S | Should | Free |
| 7.4 | **Figma plugin.** Create styles and variables, two-way sync | uicolors.app has one | Designers | L | Should | Pro |
| 7.5 | **GitHub Action.** Fail PRs when brand tokens drop below contrast, or when tokens drift from a Tintwork palette; sync tokens by PR | Nobody | Teams | M | Should | Pro |
| 7.6 | **VS Code extension.** Inline swatches, "generate scale from color under cursor" | Nobody | Developers | L | Nice | Free |
| 7.7 | **Vite/Tailwind plugin** generating theme from a `tintwork.config` | Nobody | Developers | M | Nice | Free |

## 8. Pro polish

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 8.1 | **Command palette (Cmd/Ctrl+K) and shortcuts.** Space shuffles (built); add arrows to move stops, L lock, C copy, E export, D dark, Z undo | Spacebar only elsewhere | Power users | S | Must | Free |
| 8.2 | **PWA and offline.** Everything is client-side, so the app works offline once installed | Nobody | Travelers, low-bandwidth regions | M | Should | Free |
| 8.3 | **Embed widget.** Web component or iframe showing a palette or contrast checker with "Made with Tintwork" | Nobody | Bloggers, docs sites | M | Nice | Free with badge; Pro removes it |
| 8.4 | **Print and PDF brand sheet.** Palette, names, hex/OKLCH, contrast pairs, usage, optional logo, Groundwork-style template | Nobody | Agencies, clients | M | Should | Pro |
| 8.5 | **Multi-language UI.** English, Somali, Swahili, Arabic with right-to-left, native-speaker review | Nobody | Regional users | L | Should | Free |
| 8.6 | **Theming of the tool itself** (density, reduced motion presets) | Nice | Everyone | S | Nice | Free |

## 9. Product and growth

| # | Feature | Beats | User value | Effort | Priority | Tier |
|---|---|---|---|---|---|---|
| 9.1 | **SEO landing pages per color.** `/tailwind-colors/indigo`, "blue Tailwind palette" pages with scale, contrast table, exports and "customize" button. Needs real content per page to avoid thin pages | uicolors.app has one tailwind-colors page | Search visitors | M | Must | Free |
| 9.2 | **OG images per palette** (built); extend to per-color pages | Rare | Social sharing | Done/S | Done | Free |
| 9.3 | **Changelog and RSS** | Trust signal | Returning users | S | Should | Free |
| 9.4 | **Docs site.** How scales work, Tailwind v4 theming, shadcn theming, accessibility guide; static pages | Credibility and SEO | Developers | M | Should | Free |
| 9.5 | **Privacy-friendly analytics.** Self-hosted cookieless (Plausible or Umami); events for copy, export and share; privacy page updated | uicolors.app uses PostHog | Us | S | Should | Free |
| 9.6 | **Groundwork branding and lead capture.** "Need a design system built?" CTA in exports and brand sheets, contact form, opt-in newsletter; no dark patterns | Business goal | Groundwork | M | Must | Free |
| 9.7 | **Feedback and public roadmap voting** | Community | Us | S | Nice | Free |
| 9.8 | **Launch kit.** Product Hunt, Show HN, dev.to articles, comparison pages with verified facts | Growth | Us | S | Should | Free |

## 10. Quality

| # | Feature | Why | Effort | Priority | Tier |
|---|---|---|---|---|---|
| 10.1 | **Test coverage.** Engine at 100% branch coverage with property tests, export parsers round-trip, Playwright visual snapshots per tab and breakpoint | Trust in "correct color" is the brand | M | Must | n/a |
| 10.2 | **Performance budget.** JS for `/` at or under 150 KB gzipped, lazy-load preview tabs, Lighthouse CI at 95+ | Fast tool beats heavy competitors (uicolors.app HTML is about 230 KB before JS) | S | Must | n/a |
| 10.3 | **Accessibility audit.** axe in CI, manual screen-reader and keyboard pass, published conformance statement | Credibility for an accessibility product | S | Must | n/a |
| 10.4 | **Security.** CSP, rate limits and SSRF guards before any server feature (3.3, 7.2) ships | Required for server features | S | Must (with those features) | n/a |
| 10.5 | **Error monitoring, privacy-preserving.** Optional | Reliability | S | Nice | n/a |

---

## Recommended build order

### Phase 1: quick wins (high visibility, mostly S, all Free)
Undo and redo (6.2), command palette and shortcuts (8.1), anchor control (1.5), lock and edit shades (1.3), harmony accent and secondary scales (1.6), neutral pairing options (1.7), ZIP download (5.2), Style Dictionary, Flutter, iOS and Android exports (5.3 to 5.5), modern CSS output (5.7), color-vision simulation (2.3, 4.7), policy-aware badges and non-text checks (2.2), palette-aware text picker (2.5), performance and accessibility CI gates (10.2, 10.3), privacy-friendly analytics (9.5), Groundwork CTA and lead capture (9.6).

### Phase 2: differentiators (the reasons people switch)
Contrast-targeted generation and auto-fix (1.4, 2.4), full light and dark semantic token layer (1.9), import and migrate plus compare (6.4, 6.5), logo and image extraction (3.2), custom curve editor (1.2), P3 UI and export (1.10), published engine and CLI, plus the MCP server (7.1, 7.3), preset library (3.6), email preview (4.3), per-color SEO pages and docs (9.1, 9.4), PWA (8.2), multi-language UI (8.5), test and visual-regression coverage (10.1).

### Phase 3: Pro and monetization
Optional account with cloud sync and projects (6.7, 6.3), AI palette suggestions (3.4), URL extraction (3.3), public API keys and quotas (7.2), Figma plugin and variable sync (7.4, 5.8), GitHub Action (7.5), accessibility report and PDF brand sheet (2.6, 8.4), embed without badge (8.3), team libraries (6.8), live-on-your-site hosted previews (4.2), VS Code extension (7.6).

Suggested Pro bundle (a hypothesis to validate, not a committed price): cloud sync, AI, URL extraction, API quota, Figma and GitHub integrations, branded PDF and embeds, team libraries. Everything a solo developer needs to generate, check and export a palette stays free.

---

## Risks and open decisions

1. **APCA is a draft standard** and the reference implementation has licensing terms; we use our own implementation of the published formula. Label it informational and get a legal check before marketing it.
2. **AI cost and abuse:** needs rate limiting, no stored prompts, and a fallback when the model is unavailable. The engine, not the model, makes every final color decision.
3. **URL extraction and any proxy:** SSRF, robots and copyright concerns; keep server-side, allow-listed, and rate limited.
4. **Accounts versus local-first:** recommended default is no account for everything in Phases 1 and 2.
5. **Translation quality:** Somali, Swahili and Arabic need native-speaker review, and Arabic needs a full right-to-left pass and a font decision, since the current design uses Manrope only (Manrope has no Arabic glyphs).
6. **Competitor claims** marked *(verify)* need a manual check before any public comparison page (9.8).
7. **Per-color SEO pages** must carry real content; thin programmatic pages can hurt rankings.

## Decisions I need from you before building

1. Which tier boundary do you want for Pro, and is a free-forever core (no sign-in) a fixed rule?
2. Arabic typeface: add one (breaks "Manrope only" for Arabic), or skip Arabic for now?
3. Hosting and database: can we add small server features (API, short links, AI) in Phase 3, or must the product stay fully static?
4. Do you want the engine published as an open-source package under the Groundwork name?
5. Analytics choice: self-hosted Plausible/Umami, or none.
