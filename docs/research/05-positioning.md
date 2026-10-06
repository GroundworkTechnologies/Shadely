# 05 — Positioning

**One-liner:** *Tintwork turns one brand color into an accessible, Tailwind-ready system — scales, semantic tokens, dark mode and real UI previews — free, no sign-in, shareable by link.*

## Where Tintwork wins

| Lever | What we do | Beats | Phase |
|---|---|---|---|
| **Perceptual scales** | OKLCH engine, base anchored at its natural stop (not forced to 500), gamut-mapped by chroma reduction, optional P3 | UI Colors (HSL, pinned 500) | MVP |
| **Accessibility built in** | WCAG 2.2 + APCA, per-shade chips, **11×11 pairing matrix**, "minimum shade for AA on white/black" | UI Colors (single metric per shade), Tints.dev (none) | MVP |
| **Live preview on real UI** | Buttons, forms, cards, table, alerts, charts, landing hero — all themed from the generated scales; light/dark | Tints.dev (none), Realtime Colors (one page) | MVP |
| **Zero-friction sharing** | Full state in the URL; localStorage for saved list; no account | UI Colors (account-gated) | MVP |
| **Every format, correct** | v4 `@theme`, v3 config, CSS vars, SCSS, JSON, DTCG, Tokens Studio, P3 variants | all | MVP |
| **Brand palette sets** | Brand + accent (harmony) + tinted neutral + status (success/warning/danger/info) in one export, free | UI Colors Pro tier | MVP (basic) / v2 (harmony) |
| **Dark mode mapping** | Auto-generate semantic tokens (`--background`, `--primary`, …) for light and dark with contrast guarantees; shadcn-compatible | everyone | v2 |
| **Color-vision simulation** | Protan/deutan/tritan/achromat preview toggle | everyone | v2 |
| **Image / logo → palette** | Client-side dominant-color extraction (median cut) → pick brand color → full scale. No upload to a server | Coolors (no scales) | v2 |
| **AI suggestions** | LLM-assisted: describe brand ("calm fintech for farmers") → candidate base colors with rationale, validated by our engine | all | later |
| **Open API / CLI** | `GET /api/v1/scale/{hex}` plus `npx tintwork` (thin wrapper on the engine package) | UI Colors (paid, anti-competitive terms) | v2 |
| **Speed & weight** | Static-first Next.js, system+one variable font, no third-party trackers by default | UI Colors (~230 KB HTML, third-party fonts/analytics) | MVP |

## Principles
- **Correctness is the brand.** Every number on screen is computed from the exact hex we export.
- **Tool first, marketing second.** The home page *is* the generator with a good default.
- **Free core, nothing gated that a solo dev needs.** (Monetization later = teams, hosted API, Figma plugin; out of MVP scope.)
- **Privacy:** no accounts, no uploads; analytics (if any) cookieless, opt-out-friendly.

## Target users
1. Indie devs / startups on Tailwind needing a brand scale in 2 minutes.
2. Designers handing off tokens to developers (Figma/DTCG).
3. Accessibility-conscious teams who need proof (matrix, report).
4. Groundwork Technologies' own client projects (dogfood).

## Success metrics (post-launch)
Time to first copy < 30 s; % sessions that copy an export; share-link opens; Lighthouse ≥ 95 across the board; palette passes AA for text-on-50 and white-on-600 in ≥ 95% of random base colors (engine property test).
