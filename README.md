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
| `0`       | the assembled page (Hero → The Problem) |
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

| #   | Name               | Signature interaction                                       | |
| --- | ------------------ | ----------------------------------------------------------- | --- |
| 01  | Six Calendars      | drag one customer across two years of separate decisions     | reference |
| 02  | The Relay          | quality rises and coherence drains in the same motion        | reference |
| 03  | The Rewrite        | six defensible edits, then the original returns underneath   | reference |
| 04  | The Sign-Off Sheet | the row nobody signed — and the form refuses your signature  | reference |
| 05  | The Seams          | the joins stay visible, and the line crosses every one       | **final** |

## The spine

Hero 04's stroke is not decoration and not a scroll indicator. **It is the
customer.** It never stops — which is the entire reason the gaps in Section 02
cost anything: the business's work is discontinuous, the person moving through
it is not.

[`Spine`](src/components/Spine.tsx) draws one stretch per section, scrubbed by
that section's own scroll. In Section 02 it enters at the x the Hero left it on
and runs along the **base** of the object — crossing the base still crosses
every join, without cutting six panels into twelve — then survives the blackout
and carries on down into Section 03. Each join reaches past the base as a
separate `.tick` element and cuts the path; it cannot just be a taller seam,
because below the object the ground is ink and an ink join would be invisible.

Three things that are load-bearing, not incidental:

- **`position: sticky`, not `fixed`.** Fixed hangs over whichever section is on
  screen, and cannot travel in with a section that is still arriving — which is
  exactly where the line has to stay unbroken.
- **`start: 'top bottom'`.** Starting once the section has topped out leaves a
  visible break at the join, because the previous stroke has already left the
  bottom of the screen.
- **The trigger is the nearest `<section>`.** `html` is `height: 100%`, so as a
  trigger it measures one viewport, start and end collapse, and the stroke never
  advances at all.

`mix-blend-mode: difference` keeps it legible over the ink ground and over the
paper object without ever being recoloured.

## The page

[`Assembled`](src/sections/Assembled.tsx) renders the chosen directions in
sequence as one continuous scroll — the default view, and the only way to judge
whether the spine actually carries. The Hero's stroke leaves at x=84 and Section
02's enters at x=84, so the handoff is invisible. Sections 03–06 append here as
they are built.

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
