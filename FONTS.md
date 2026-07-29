# Typefaces

## In use

- **Display / headings** — **Anton** (Google Fonts)
- **Body** — Suisse Int'l, falling back to Archivo
- **Utility / annotation** — Suisse Int'l Mono, falling back to JetBrains Mono

Anton ships a **single weight (400)**. `.display` therefore sets `font-weight:
400` and `font-synthesis-weight: none` — asking for a heavier weight would make
the browser fake one and smear the stems.

Anton also has a tall cap height and sets very tight, so it reads larger than a
neutral grotesque at the same size; `--t-display` is pulled back to compensate.
And its comma drops well below the baseline, which is why `.maskline` carries a
padding/negative-margin pair so reveals don't slice it off.

## Suisse

Suisse is licensed from Swiss Typefaces and is not bundled here. It sits first
in the body and mono stacks, so:

1. Drop the licensed `.woff2` files into `src/fonts/`.
2. Add `@font-face` blocks naming the families exactly
   `Suisse Intl` and `Suisse Intl Mono`.
3. Drop `Archivo` and `JetBrains+Mono` from the Google Fonts `<link>` in
   `index.html` — keep `Anton`.

`--wdth-display` / `--wdth-body` only affect the Archivo fallback and are
ignored by Anton and by any static family.

## Tuning knobs

`src/styles/tokens.css`

| Token             | Does                                        |
| ----------------- | ------------------------------------------- |
| `--wdth-display`  | how condensed the headings run (62 = tightest) |
| `--t-display`     | headline size ramp                          |
| `--chamfer`       | the 45° corner cut, applied via `.chamfer`   |
