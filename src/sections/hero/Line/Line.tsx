import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import Chrome from '../../../components/Chrome'
import Spine from '../../../components/Spine'
import styles from './Line.module.css'

/* The customer's path across the Hero. It frames the claim and leaves
   at x=84, which is where Section 02 picks it up — the same component,
   the same stroke, the same coordinate space. One line, drawn in
   stretches, not a new line per section. */
const SPINE = 'M 84 -60 V 300 H 1356 V 620 H 84 V 960'

/* Where the stroke turns, as a fraction of its own length — used to
   pop each node at the moment the line reaches it. */
const NODES = [
  { left: '5.833%', top: '33.333%', at: 0.0965 },
  { left: '94.167%', top: '33.333%', at: 0.4575 },
  { left: '94.167%', top: '68.889%', at: 0.548 },
  { left: '5.833%', top: '68.889%', at: 0.909 },
]

/** Short on purpose. A visitor who scrolls at once must never arrive to
 *  a line that appears to start in mid-air for no reason. */
const DRAW = 1.15

/**
 * 01 · 04 — THE UNBROKEN LINE
 *
 * The stroke itself lives in [Spine], shared with every section that
 * follows, so what continues down the page is literally the same line
 * rather than a lookalike handing over to another implementation.
 * This section owns only the content it frames.
 */
export default function Line({ flow = false }: { flow?: boolean }) {
  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const nodes = q(`.${styles.node}`) as HTMLElement[]
    const sub = q(`.${styles.sub}`)
    const note = q(`.${styles.note}`)

    if (reduced) {
      gsap.set([...nodes, sub, note], { opacity: 1 })
      gsap.set(q('.maskline > span'), { yPercent: 0 })
      return
    }

    const tl = gsap.timeline()

    /* Each corner lights as the stroke arrives at it. */
    NODES.forEach((n, i) => {
      tl.fromTo(
        nodes[i],
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' },
        n.at * DRAW
      )
    })

    /* The headline does not wait for the line to finish. It arrives
       alongside it, so the first screen is settled in well under two
       seconds. */
    tl.from(
      q('.maskline > span'),
      { yPercent: 115, duration: 0.85, stagger: 0.1, ease: 'power4.out' },
      0.28
    )
      .to(sub, { opacity: 1, duration: 0.6 }, 0.85)
      .to(note, { opacity: 1, duration: 0.6 }, 1.15)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div
      className={`${styles.root} ${flow ? styles.rootFlow : ''}`}
      ref={root}
    >
      <Spine d={SPINE} mode="intro" duration={DRAW} />

      <Chrome tone="dark" showFooter={false} />

      {NODES.map((n) => (
        <span
          key={`${n.left}-${n.top}`}
          className={styles.node}
          style={{ left: n.left, top: n.top }}
          aria-hidden="true"
        />
      ))}

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
        <span className={`${styles.note} label`}>
          The line never lifts — it runs the whole page ↓
        </span>
      </div>

      <div className={styles.foot}>
        <span className="label">India — 2026</span>
      </div>
    </div>
  )
}
