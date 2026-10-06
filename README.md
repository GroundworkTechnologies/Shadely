# Tintwork

Tailwind color palette generator by [Groundwork Technologies](https://groundwork.co.ke). One brand color in, an accessible 50–950 scale out.

- OKLCH engine, base color pinned at its natural stop (or any stop you choose), gamut-mapped by chroma reduction
- Pin, lock or type any shade; the rest of the scale re-flows around it
- Harmony scales (analogous, complementary, split, triadic, tetradic, square), Tailwind neutral families, real color names
- WCAG 2.2 and APCA contrast, per-shade and as a pairing matrix
- Live preview on real UI (landing, dashboard, forms), light and dark
- Color-vision simulation (protan, deutan, tritan, mono) and a check for scales that become confusable
- Export: Tailwind v4 `@theme`, Tailwind v3 (ESM/CJS/TS), CSS variables, modern CSS (OKLCH + `light-dark()`), SCSS, JSON, DTCG, Tokens Studio, Style Dictionary, shadcn/ui, Flutter, Android, Jetpack Compose, iOS, plus one ZIP with everything
- State lives in the URL (shareable) and localStorage (saved palettes). No accounts, no database.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Vitest): engine, exports, design tokens
npm run lint && npm run typecheck && npm run build
npm run e2e        # Playwright: app flows, responsive, axe accessibility, JS budget (needs a build)
```

Set `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap and OG images (see `.env.example`).

## Layout

- `src/engine/` pure TypeScript color engine, zero runtime dependencies, no UI imports (enforced by ESLint)
- `src/components/`, `src/app/` Next.js App Router UI
- `docs/research/` Phase 1 research, `docs/plan/` plan and the algorithm spec

## Keyboard

| Key | Action |
|---|---|
| `Space` | Random base color |
| `Ctrl/Cmd+K` | Command palette |
| `Ctrl/Cmd+Z`, `Shift+Ctrl/Cmd+Z` | Undo, redo |
| `D` | Toggle light and dark preview |
| `E` | Jump to export |
