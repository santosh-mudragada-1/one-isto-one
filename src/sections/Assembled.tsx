import Line from './hero/Line/Line'
import Seams from './problem/Seams/Seams'
import FocusList from './answer/FocusList/FocusList'
import Questions from './thinking/Questions/Questions'
import Mobile from './studio/Mobile/Mobile'
import Apart from './close/Apart/Apart'

/**
 * THE PAGE
 *
 * The chosen directions in sequence, as one continuous scroll.
 *
 * The spine is not here and not in any of them. It is one path for the
 * whole page, mounted once in [App] and measured off whatever these
 * sections turn out to be — see `lib/spine.ts`. Each section only
 * declares the shape of its own stretch, and continues from wherever
 * the last one left the stroke, so there is no handoff between two
  * sections that could come apart.
 */
export default function Assembled() {
  return (
    <>
      <Line flow />
      <Seams />
      <FocusList />
      <Questions />
      <Mobile />
      <Apart />
    </>
  )
}
