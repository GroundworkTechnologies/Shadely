# Tintwork

Tailwind color palette generator by [Groundwork Technologies](https://groundwork.co.ke). One brand color in, an accessible 50–950 scale out.

- OKLCH engine, base color pinned at its natural stop, gamut-mapped by chroma reduction
- WCAG 2.2 and APCA contrast, per-shade and as a pairing matrix
- Live preview on real UI (landing, dashboard, forms), light and dark
- Export: Tailwind v4 `@theme`, Tailwind v3 (ESM/CJS/TS), CSS variables, SCSS, JSON, DTCG, Tokens Studio
- State lives in the URL (shareable) and localStorage (saved palettes). No accounts, no database.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # color engine unit tests (Vitest)
npm run lint && npm run typecheck && npm run build
```

Set `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap and OG images (see `.env.example`).

## Layout

- `src/engine/` pure TypeScript color engine, zero runtime dependencies, no UI imports (enforced by ESLint)
- `src/components/`, `src/app/` Next.js App Router UI
- `docs/research/` Phase 1 research, `docs/plan/` plan and the algorithm spec
