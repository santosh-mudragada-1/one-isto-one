/**
 * THE SPINE — geometry
 *
 * One stroke runs the length of the page. It is not decoration and not
 * a scroll indicator: it is the customer. So it is authored, measured
 * and drawn as ONE polyline. There is no per-section stroke, no handoff
 * and nothing to synchronise — which is the only way a join can be
 * guaranteed not to open.
 *
 * ── the coordinate space ──────────────────────────────────────────
 *
 * A stretch is authored against the screen its section HOLDS STILL
 * while it plays, not against the section's scroll length. Every
 * section here is a tall block containing one sticky screen, so:
 *
 *   x   fraction of the viewport width,  in 1440ths
 *   y   fraction of that held screen,    in 900ths, from its top
 *
 * So `{ y: 594 }` means 66% down the screen the section pins — which
 * is where Section 02's object has its base, whatever the window size.
 *
 * The component turns this into one continuous path by placing each
 * section's stretch at the point on the line where that section's
 * screen arrives, then walking down through all of them in order.
 */

/** Width the x values are authored against. */
export const VW = 1440
/** Height the y values are authored against — of the HELD screen. */
export const VU = 900

export type Turn = {
  /** Where the stroke stops descending, in 900ths of the held screen. */
  y: number
  /** Where it then runs across to, in 1440ths of the width. */
  x: number
  /** Mark both ends of the run. The Hero's frame corners only. */
  node?: boolean
}

export type Stretch = {
  /**
   * The x the stroke arrives on.
   *
   * Only read when this section is the FIRST one on the page — which
   * happens when a single version is opened on its own for review.
   * In the assembled page every section simply continues from wherever
   * the previous one left the stroke, so a mismatch between two
   * sections cannot open a gap. It is not possible to author one.
   */
  enter: number
  turns: Turn[]
  /** Draws itself once on load, before scroll takes over. Hero only. */
  intro?: boolean
  /**
   * A selector inside this section for the thing the stroke LANDS ON.
   *
   * Only read when this is the last section on the page. The stroke
   * runs to that element's centre and stops there — measured off the
   * laid-out page, so the landing is exact at any width — instead of
   * running on past the bottom edge. It is how the line ends.
   */
  end?: string
}

export const STRETCHES: Record<string, Stretch> = {
  /* Frames the claim: down the left, across the top, down the right,
     back across the bottom, and away down the left again — leaving on
     the same x Section 02 opens on. */
  hero: {
    enter: 84,
    intro: true,
    turns: [
      { y: 300, x: 1356, node: true },
      { y: 620, x: 84, node: true },
    ],
  },

  /* Runs along the BASE of the object rather than through it: crossing
     the base still crosses every join, without cutting six panels into
     twelve. The object is 32vh and centred, so its base is at 66%. */
  seams: {
    enter: 84,
    turns: [{ y: 594, x: 1290 }],
  },

  /* Straight through. The five names travel past a customer who does
     not move — that is the whole point of the section. */
  focus: {
    enter: 1290,
    turns: [],
  },

  /* Kept for review alongside `focus`. */
  'second-line': {
    enter: 1290,
    turns: [],
  },

  /* The line stops descending and becomes the margin rule the page is
     written against — 13.9%, which is 200 of 1440. */
  thinking: {
    enter: 1290,
    turns: [{ y: 116, x: 200 }],
  },

  /* Turns and runs ACROSS the screen — the rail one customer's day
     travels along. It is the only time the line is horizontal for a
     whole section, and the only time the page moves sideways. */
  studio: {
    enter: 200,
    turns: [{ y: 540, x: 1290 }],
  },

  /* And it stops. Fifteen screens of stroke end on a 9px square —
     the same square the colon of the mark is built from. Nothing
     else on this site ends. */
  close: {
    enter: 1290,
    turns: [],
    end: '[data-spine-end]',
  },
}
