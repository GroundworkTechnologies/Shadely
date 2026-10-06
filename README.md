# Tintwork

Tailwind color palette generator by [Groundwork Technologies](https://groundwork.co.ke). One brand color in, an accessible 50–950 scale out.

- OKLCH scales: your color lands on the shade it naturally belongs to, in gamut and with real color names
- Accessible by default: WCAG 2.2 and APCA contrast, an optional "pass AA" switch, color-vision simulation
- 11 live preview pages (cards, website, branding, dashboard, components, shadcn/ui, apps, charts, gradients, logos, headings), light and dark
- Export to Tailwind v4 and v3, CSS, SCSS, JSON, design tokens, shadcn/ui, Flutter, Android, Compose and iOS, or all of it as one ZIP
- State lives in the URL (shareable) and your browser (saved palettes). No accounts, no database.

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

`Space` random color · `Ctrl/Cmd+Z` undo · `Shift+Ctrl/Cmd+Z` redo
