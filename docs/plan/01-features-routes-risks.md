# Phase 2 — Plan (part 1): features, routes, risks

## 1. Feature list

### MVP
1. **Generator workspace** at `/`: hex input (also accepts `rgb()`, `hsl()`, `oklch()`, named), native color picker, random (Spacebar), pre-filled default (no empty state).
2. **Scale engine**: OKLCH 11-stop scale, anchored base, gamut-mapped, tunable (lightness range, chroma scale, hue shift) via 3 sliders + reset.
3. **Palette sets**: brand + tinted neutral (auto, derived from brand hue) + status (success/warning/danger/info, hue-fixed with brand-harmonized chroma). Each toggleable and renamable.
4. **Contrast panel**: per-shade chips (WCAG 2.2 / APCA toggle), 11×11 pairing matrix, "minimum shade" hints.
5. **Live preview** on real components, light/dark: buttons, inputs/forms, cards, alerts/badges, table, nav, chart (SVG), landing hero. Preview uses the exact exported values via CSS variables.
6. **Export** (copy + download): Tailwind v4 `@theme`, v3 config (CJS/ESM/TS), CSS variables, SCSS, JSON, DTCG, Tokens Studio. Color syntax: oklch / hex / hsl / rgb / P3.
7. **Share by link**: whole state in URL (versioned, compact). **Saved palettes** in localStorage (list, rename, delete, import/export JSON).
8. **Tailwind colors reference** page (v3 + v4 defaults, click-to-copy, "start from this").
9. **Quality**: keyboard navigation, focus rings, `prefers-color-scheme` + manual theme toggle, responsive down to 360 px, reduced-motion.
10. **Site**: Groundwork Technologies branding in footer + metadata, SEO basics (titles, descriptions, canonical, sitemap, robots, JSON-LD `WebApplication`), dynamic OG image per shared palette.

### v2
- Harmony-derived **accent/secondary** scale (analogous, complementary, split, triadic, tetradic).
- **Semantic dark-mode token mapping** with guaranteed contrast (shadcn/ui-compatible CSS vars).
- **Image/logo → palette** (client-side median-cut), pick color → scale.
- **Color-vision simulation** toggle on preview.
- **P3** preview with gamut badge.
- **Public API** `GET /api/v1/scale/{hex}` and `npx tintwork` CLI (engine published as `@groundwork/tintwork-engine`).
- Pairing-matrix **report export** (PNG/PDF/markdown).
- `/contrast` standalone checker; `/tailwind-colors/[name]` SEO pages.
- Playwright e2e + axe a11y CI.

### Later
- AI brand-brief → base color suggestions (server-side LLM call, rate-limited, engine-validated).
- Figma plugin, VS Code extension, Tailwind plugin.
- Accounts / team libraries / hosted palettes (only if demand).
- Gradient and chart-palette generators (categorical, sequential, diverging).
- i18n.

## 2. Route map

| Route | Type | Notes |
|---|---|---|
| `/` | Page (client island on static shell) | Generator; state from `?` params |
| `/palettes` | Page (client) | Saved palettes from localStorage |
| `/tailwind-colors` | Static page | v3/v4 defaults; `?v=3|4` |
| `/about` | Static | Product + Groundwork Technologies |
| `/privacy` | Static | Plain statement: no accounts, local storage only |
| `/api/og` | Route handler (`next/og`, edge) | OG image from `?c=` palette params; falls back to default |
| `/sitemap.xml`, `/robots.txt` | Metadata routes | |
| `/api/v1/scale/[hex]` | Route handler (v2) | JSON; CORS open; cached |
| `/contrast` (v2), `/tailwind-colors/[name]` (v2) | | |

**URL state schema (v1).** `/?v=1&b=3b82f6&n=t&s=1&f=v4&c=oklch&t=dark&o=h0,c100,l0`
- `b` brand hex (no `#`), `n` neutral mode (`t` tinted / `g` gray / `o` off), `s` status on/off, `f` export format, `c` color syntax, `t` preview theme, `o` tuning offsets. Unknown/invalid params are ignored, never thrown on. `v` increments with migrations (old links keep working). Multiple palettes (v2): `p=name:hex:opts,…`.

## 3. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| APCA is draft; reference code license (`apca-w3`) restrictions | Legal/trust | Implement from published math; label "draft, informational"; WCAG 2.2 stays default; legal check before shipping APCA numbers |
| Gamut mapping edge cases (yellows, high-chroma blues, near-neutral) | Ugly/clipped shades | Property tests across a hue×chroma×lightness grid; "clipped" badge |
| Anchor logic surprises users used to base = 500 | Confusion | Show which stop the base landed on; offer "force to 500" toggle |
| URL length with many palettes | Broken shares | Compact encoding; cap at ~1.5 KB; fall back to localStorage-id warning |
| OG image from arbitrary params | Abuse/perf | Validate hex strictly, cache, edge runtime, size limits |
| DTCG / Tokens Studio spec drift | Wrong exports | Pin spec version in output; test with fixtures; verify before build |
| Tailwind v4 minor changes (v4.2 palettes etc.) | Stale reference page | Generate reference data from the `tailwindcss` package at build |
| Competitor claims in docs unverified (`?` cells) | Inaccurate marketing | Verify manually before any public comparison |
| Reference teardown not done in a live browser | Missed features | 20-min manual click-through before Phase 3 sign-off (I can't render the SPA from here) |
| Dependency creep | Maintenance | Engine has 0 runtime deps; UI deps listed in architecture doc |

## 4. Open questions (need your input; defaults chosen if you don't answer)

1. **Groundwork brand assets**: logo, brand color, preferred footer wording? *Default: text wordmark "Tintwork", accent derived from a teal-green base `#2f8f6b`, footer "A Groundwork Technologies product" linking to groundwork.co.ke.*
2. **Domain / deploy target**? *Default: Vercel-compatible, `metadataBase` from env `NEXT_PUBLIC_SITE_URL`.*
3. **Analytics**? *Default: none in MVP.*
4. **License**: engine open source (MIT) or private? *Default: private repo, engine kept isolated so it can be opened later.*
5. **Package manager**: npm (as required). **Repo**: git not initialized; *default: `git init` at Phase 3 start, conventional commits.*
6. **Node**: local is 22.23 (OK for Next.js current).
7. **Fonts**: *Default: Geist Sans + Geist Mono via `next/font` (self-hosted, no third-party request).*

## 5. Build log: scope pulled forward from v2

- **All 11 preview pages** (Cards, Website, Branding, Dashboard, Components, Shadcn/ui, Apps, Charts, Gradients, Logos, Headings), all drawn with SVG/CSS (no stock photos), themed by CSS variables, light and dark.
- **shadcn/ui theme export** (`:root`, `.dark`, `@theme inline`) with semantic tokens whose text/background pairs are guaranteed to reach WCAG AA (unit-tested across 12 base colors in both themes). This delivers the "dark-mode semantic mapping" item early.
- **Workspace layout** reworked after studying the reference's interaction patterns: large labeled scale tiles, role tabs (brand / neutral / status), a tool row (contrast matrix, color info, export), and a color-info table with every value copyable.
