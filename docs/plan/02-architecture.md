# Phase 2 — Plan (part 2): architecture

## 1. Principles
- **Engine is pure TypeScript**: no DOM, no React, no Node APIs, zero runtime deps, deterministic. Lives in its own folder with its own tests and public `index.ts`; UI imports only from that entry.
- **State is a single serializable object** (`PaletteState`) ⇄ URL ⇄ localStorage. UI derives everything from it with pure functions.
- **Server components for shell/SEO; one client island for the workspace.**
- **Preview themed via CSS variables** set on a wrapper element from the computed scales; no per-component recoloring logic.

## 2. Stack and dependencies

| Need | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript `strict` + `noUncheckedIndexedAccess` | Required |
| Styling | Tailwind CSS v4 | Required; dogfoods `@theme` |
| UI primitives | shadcn/ui pattern (copied components on Radix: dialog, tabs, tooltip, dropdown, switch, slider) + `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` | Accessible primitives without hand-rolling |
| Tests | Vitest (engine + utils), Testing Library (a few components), Playwright + axe (v2) | Fast, TS-native |
| Lint/format | ESLint (next config), Prettier | |
| Dev-only cross-check | `culori`, `apca-w3`, `tailwindcss` (reference data) as **devDependencies** for test oracles | Not shipped |
| Not used | state libs, form libs, color libs at runtime, UI kits, analytics | Fewer deps |

Runtime deps estimate: next, react, react-dom, ~6 Radix packages, cva, clsx, tailwind-merge, lucide-react.

## 3. Folder structure

```
shadely/
├─ docs/{research,plan}/
├─ public/                      # icons, static assets
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             # fonts, metadata, theme script, footer
│  │  ├─ page.tsx               # generator shell (server) + <Workspace/>
│  │  ├─ palettes/page.tsx
│  │  ├─ tailwind-colors/page.tsx
│  │  ├─ about/ privacy/
│  │  ├─ api/og/route.tsx
│  │  ├─ sitemap.ts  robots.ts  opengraph-image.tsx
│  │  └─ globals.css            # @theme tokens (design system)
│  ├─ engine/                   # PURE — no imports from outside this folder
│  │  ├─ index.ts               # public API
│  │  ├─ color-space.ts         # sRGB⇄linear⇄Oklab⇄OKLCH, P3
│  │  ├─ parse.ts format.ts     # hex/rgb/hsl/oklch in/out
│  │  ├─ gamut.ts               # in-gamut test, chroma-reduction mapping
│  │  ├─ scale.ts               # generateScale(base, options)
│  │  ├─ curves.ts              # reference L and C curves (data)
│  │  ├─ neutral.ts status.ts   # derived palettes
│  │  ├─ contrast.ts            # wcag.ts, apca.ts, matrix
│  │  ├─ harmony.ts (v2)
│  │  ├─ export/                # tailwind-v4, tailwind-v3, css, scss, json, dtcg, tokens-studio
│  │  ├─ state.ts               # PaletteState schema, encode/decode, migrate
│  │  └─ __tests__/ + fixtures/
│  ├─ components/
│  │  ├─ ui/                    # shadcn-style primitives
│  │  ├─ workspace/             # ColorInput, ScaleStrip, TuningPanel, ContrastPanel, Matrix, ExportDialog
│  │  ├─ preview/               # PreviewShell, Buttons, Forms, Cards, Table, Chart, Hero …
│  │  └─ site/                  # Header, Footer, ThemeToggle
│  ├─ hooks/                    # useUrlState, useLocalPalettes, useCopy, useHotkey
│  └─ lib/                      # cn(), site config, metadata helpers
├─ vitest.config.ts  tsconfig.json  eslint.config.mjs  package.json (npm)
└─ .github/workflows/ci.yml     # lint, typecheck, test, build
```

An ESLint `no-restricted-imports` rule enforces: `src/engine/**` may not import from `react`, `next`, `src/components`, `src/hooks`, `src/lib`.

## 4. Data flow

```
URL ?params ──decode──▶ PaletteState ──generate (engine)──▶ ScaleSet
     ▲                      │                                   │
     └──encode (debounced)──┘                       ┌───────────┼───────────┐
 localStorage (saved list)                         Swatches   Preview     Exports
                                                   +Contrast  (CSS vars)  (strings)
```
- `useUrlState` uses `history.replaceState` (debounced ~250 ms) while dragging; `pushState` on committed changes (color input blur, shuffle) so Back works.
- Engine calls are cheap (µs per scale) — no memo worker needed; `useMemo` on state.
- SSR: server reads `searchParams`, generates the initial scale, so shared links render fully without flash and OG metadata can reflect the palette (`generateMetadata`).

## 5. Performance, a11y, SEO budgets
- LCP < 1.5 s on mid mobile; JS for `/` < 120 KB gz; Lighthouse ≥ 95 (all four).
- WCAG 2.2 AA on our own UI; all controls reachable by keyboard; Spacebar-shuffle disabled while focus is in an input; live regions announce "Copied".
- Metadata via Next Metadata API; canonical URL strips params except for share pages (`noindex` on parameterized URLs, canonical → `/`).

## 6. Git and CI
- `git init`, `main` + short branches, conventional commits (`feat(engine): …`, `test:`, `docs:`, `chore:`). Commit order: scaffold → engine color-space → gamut → scale → contrast → exports → state → UI → preview → site/SEO → polish.
- CI: `npm ci && npm run lint && npm run typecheck && npm test && npm run build`.
