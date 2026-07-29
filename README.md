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

| Key       | Does                                   |
| --------- | -------------------------------------- |
| `1`–`5`   | pick a version inside the current section |
| `↑` / `↓` | move between sections                  |
| `R`       | replay the current version             |
| `Esc`     | close the switcher                     |

Sound is **currently removed** — every cue was stripped on 30 Jul 2026 so they
can be placed one at a time where they earn their place. The synth engine is
kept intact and unwired at [`src/lib/sound.ts`](src/lib/sound.ts).

## Section 01 — Hero

_Businesses are experienced as one, yet built in pieces._

| #   | Name              | Signature interaction                                  | |
| --- | ----------------- | ------------------------------------------------------ | --- |
| 01  | Actual Size       | the page measures itself — the figures are real         | reference |
| 04  | The Unbroken Line | one stroke that never lifts                             | **final** |
| 05  | The Living Ratio  | the colon splits the screen and always returns to 1:1   | reference |

02 The Sentence and 03 Registration were deleted. Numbers are kept stable, so
`4` still selects 04.

## Section 02 — The Problem

_Everyone did their job. So whose job was the part that went wrong?_

Where the Hero is **simultaneity**, this is **sequence** — the pieces did not
arrive together. Every version is scroll-driven, and none of them resolve;
resolution belongs to Section 03.

| #   | Name               | Signature interaction                                          |
| --- | ------------------ | -------------------------------------------------------------- |
| 01  | Six Calendars      | drag one customer across two years of separate decisions        |
| 02  | The Relay          | quality rises and coherence drains in the same motion           |
| 03  | The Rewrite        | six defensible edits, then the original returns underneath      |
| 04  | The Sign-Off Sheet | the row nobody signed — and the form refuses your signature     |
| 05  | The Seams          | the joins stay visible after the pieces close                   |

One version per section ships. The rest get deleted once a direction is chosen.

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
