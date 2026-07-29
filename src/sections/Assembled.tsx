import Line from './hero/Line/Line'
import Seams from './problem/Seams/Seams'

/**
 * THE PAGE
 *
 * The chosen directions in sequence, as one continuous scroll, so the
 * spine can be judged doing the only job it was chosen for: carrying
 * from the Hero into the Problem without lifting.
 *
 * The Hero's stroke leaves at x=84 and Section 02's enters at x=84, so
 * the handoff is invisible even though each section draws its own
 * stretch. That split is required, not a shortcut: a pinned section
 * holds its content still while the document scrolls, so its line has
 * to live in viewport space and be driven by that section's progress.
 *
 * Sections 03–06 append here as they are built.
 */
export default function Assembled() {
  return (
    <>
      <Line flow />
      <Seams />
    </>
  )
}
