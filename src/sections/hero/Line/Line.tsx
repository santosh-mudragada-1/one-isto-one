import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './Line.module.css'

/**
 * 01 · 04 — THE UNBROKEN LINE
 *
 * The stroke is not here. It is one path for the whole page, drawn by
 * [Spine], and this section only declares the shape of its own stretch
 * — `hero` in `lib/spine.ts`. What runs on down the page is literally
 * the same line, not a lookalike handing over to another one.
 *
 * The frame's corner marks live in that svg too, for the same reason:
 * anything that has to stay exactly on the stroke has to BE the
 * stroke, or it will eventually come away from it.
 *
 * So this section owns only the content the line frames.
 */
export default function Line({ flow = false }: { flow?: boolean }) {
  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const sub = q(`.${styles.sub}`)

    if (reduced) {
      gsap.set(sub, { opacity: 1 })
      gsap.set(chars, { yPercent: 0 })
      return
    }

    /* The headline does not wait for the line to finish. It arrives
       alongside it, so the first screen is settled in well under two
       seconds. */
    gsap
      .timeline()
      .from(chars, { ...HEADING_REVEAL }, 0.28)
      .to(sub, { opacity: 1, duration: 0.6 }, 0.85)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div
      className={`${styles.root} ${flow ? styles.rootFlow : ''}`}
      ref={root}
      data-surface="dark"
      data-spine="hero"
    >
      <div className={styles.band}>
        <h1 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>Everything your</span>
          </span>
          <span className="maskline">
            <span>business touches,</span>
          </span>
          <span className="maskline">
            <span>drawn by one hand.</span>
          </span>
        </h1>
        <p className={`${styles.sub} label`}>One vision. Every connection.</p>
      </div>
    </div>
  )
}
