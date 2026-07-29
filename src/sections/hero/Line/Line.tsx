import { gsap, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import Chrome from '../../../components/Chrome'
import styles from './Line.module.css'

/* One stroke, entering above the frame and leaving below it. The
   geometry is authored in a 1440×900 space and stretched to the
   viewport; `non-scaling-stroke` keeps the line 1px however it lands. */
const PATH = 'M 84 -60 V 300 H 1356 V 620 H 84 V 960'

/* Where the stroke turns, as a fraction of its own length — used to
   pop each node at the exact moment the line reaches it. */
const NODES = [
  { left: '5.833%', top: '33.333%', at: 0.0965 },
  { left: '94.167%', top: '33.333%', at: 0.4575 },
  { left: '94.167%', top: '68.889%', at: 0.548 },
  { left: '5.833%', top: '68.889%', at: 0.909 },
]

const DRAW = 3.1

/**
 * 04 — THE UNBROKEN LINE
 *
 * Signature interaction: a single stroke draws the frame, reveals the
 * headline as it passes, and leaves the bottom of the screen without
 * stopping. In the full build this is the same path all the way down
 * the site — the transition between sections is that there isn't one.
 */
export default function Line() {
  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const svg = q(`.${styles.svg}`)[0] as unknown as SVGSVGElement
    const path = q(`.${styles.path}`)[0] as unknown as SVGPathElement
    const nodes = q(`.${styles.node}`) as HTMLElement[]
    const sub = q(`.${styles.sub}`)[0] as HTMLElement
    const note = q(`.${styles.note}`)[0] as HTMLElement

    const len = path.getTotalLength()

    if (reduced) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
      gsap.set([...nodes, sub, note], { opacity: 1 })
      gsap.set(q('.maskline > span'), { yPercent: 0 })
      return
    }

    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    const tl = gsap.timeline()

    tl.to(path, {
      strokeDashoffset: 0,
      duration: DRAW,
      ease: 'power1.inOut',
    })

    /* Each corner lights as the stroke arrives at it. */
    NODES.forEach((n, i) => {
      tl.fromTo(
        nodes[i],
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
        n.at * DRAW
      )
    })

    /* The headline is revealed by the line's own progress, not by a
       separate schedule — the stroke is the timekeeper. */
    tl.from(
      q('.maskline > span'),
      { yPercent: 115, duration: 1.05, stagger: 0.11, ease: 'power4.out' },
      0.42 * DRAW
    )
      .to(sub, { opacity: 1, duration: 0.8 }, 0.62 * DRAW)
      .to(note, { opacity: 1, duration: 0.8 }, 0.94 * DRAW)

    /* The stroke leans very slightly toward the cursor. Enough to feel
       alive; not enough to notice as an effect. */
    const mx = gsap.quickTo(svg, 'x', { duration: 0.9, ease: 'power3' })
    const my = gsap.quickTo(svg, 'y', { duration: 0.9, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      mx((e.clientX / window.innerWidth - 0.5) * 12)
      my((e.clientY / window.innerHeight - 0.5) * 12)
    }
    const onLeave = () => {
      mx(0)
      my(0)
    }

    scope.addEventListener('pointermove', onMove)
    scope.addEventListener('pointerleave', onLeave)

    return () => {
      scope.removeEventListener('pointermove', onMove)
      scope.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className={styles.root} ref={root}>
      <Chrome tone="dark" showFooter={false} />

      <svg
        className={styles.svg}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.path} d={PATH} />
      </svg>

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
      </div>

      <div className={styles.foot}>
        <span className="label">India — 2026</span>
      </div>

      <span className={`${styles.note} label`}>
        The line never lifts — it runs the whole page ↓
      </span>
    </div>
  )
}
