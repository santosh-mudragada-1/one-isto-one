# 1:1 — hero concepts

Five hero directions for the **1:1** studio site, in one page. Use the switcher
in the bottom-right corner to compare them.

**Live:** https://santosh-mudragada-1.github.io/one-isto-one/

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` type-checks and builds to `dist/`.

## Controls

| Key     | Does                       |
| ------- | -------------------------- |
| `1`–`5` | jump to a concept          |
| `R`     | replay the current concept |
| `S`     | sound on / off             |
| `Esc`   | close the switcher         |

Sound is **off by default**. Concept 03's registration lock is the one worth
turning it on for.

## The concepts

| #   | Name              | Signature interaction                                  |
| --- | ----------------- | ------------------------------------------------------ |
| 01  | Actual Size       | the page measures itself — the figures are real         |
| 02  | The Sentence      | the changing word physically pushes the sentence along  |
| 03  | Registration      | two impressions lock into register; the cursor un-locks them |
| 04  | The Unbroken Line | one stroke that never lifts                             |
| 05  | The Living Ratio  | the colon splits the screen and always returns to 1:1   |

Only one of these ships. The rest get deleted once a direction is chosen.

## How it's put together

```
src/
├── styles/tokens.css   the design system — colour, type, the 45° chamfer
├── lib/                gsap setup · synthesised sound · scoped effect hook
├── components/         TopBar · NavLogo · Chrome · Mark · VersionFab
└── heroes/             one self-contained folder per concept
```

React · TypeScript · Vite · GSAP. No animation library beyond GSAP, no UI kit,
no images — there is no photography for this brand yet, so every concept is
built from type, geometry and motion only.

Two details worth knowing before editing:

- **The chamfer.** Every corner that could be sharp is cut at 45°, taken from
  the flag of the numeral in the logo. Filled surfaces use `.chamfer`; outlined
  ones need `.chamfer-box`, because a clipped `border` leaves the diagonal edge
  blank and the box reads as unfinished.
- **The wordmark inverts with its surface.** `NavLogo` takes a `tone` prop
  describing the *background*, and cross-fades between `Logo-10` (for light)
  and `Logo-12` (for dark). Concept 05 drives it live off the split position.

Typeface notes are in [FONTS.md](FONTS.md).

## Deployment

Every push to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

`vite.config.ts` sets `base: './'` so the same build works at a domain root and
under the Pages project path. Anything referencing a file in `Public/` must go
through `import.meta.env.BASE_URL` or it will 404 once deployed.
