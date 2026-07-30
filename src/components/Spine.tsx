import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useGsap } from '../lib/useGsap'
import styles from './Spine.module.css'

type Props = {
  /** Path authored in a 1440×900 design space: y is a percentage of the
   *  viewport height, so 450 is 50vh and 594 is 66vh. */
  d: string
  /** `scroll` scrubs with the section — for anything that is travelled.
   *  `intro` draws once on load, for a section that does not scroll. */
  mode?: 'scroll' | 'intro'
  /** Intro only. Kept short: a visitor who scrolls before the stroke has
   *  finished should never meet a line that starts mid-air. */
  duration?: number
}

/** Design space the paths are written in. */
const VW = 1440
const VH = 900
/** Headroom above a section's top, and reach below its bottom. */
const TOP = -300
const BOTTOM = 2000

/**
 * Rewrites a design-space path into real pixels.
 *
 * The svg is deliberately 1:1 with the screen rather than scaled by a
 * viewBox. A viewBox here scales x by width and y by height, and those
 * two are almost never equal — which with `vector-effect:
 * non-scaling-stroke` makes dash lengths screen-relative and direction-
 * dependent, so the stroke stops short partway along its own path. It
 * looked correct only at exactly 1440×900, where both scales are 1.
 *
 * Only M / V / H appear in these paths, so the rewrite stays this small.
 */
function toPixels(d: string, sx: number, sy: number) {
  return d.replace(/([MVH])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g, (_, cmd, a, b) => {
    if (cmd === 'M') return `M ${(+a * sx).toFixed(2)} ${(+b * sy).toFixed(2)}`
    if (cmd === 'V') return `V ${(+a * sy).toFixed(2)}`
    return `H ${(+a * sx).toFixed(2)}`
  })
}

/**
 * THE SPINE
 *
 * One stroke running the length of the site. It is not decoration and
 * not a scroll indicator: **it is the customer.** It never stops, which
 * is the whole reason the gaps in Section 02 cost anything.
 *
 * Each section supplies its own stretch and hands off at the same x, so
 * the stroke is continuous across a boundary even though it is drawn
 * per-section — which is required, not a shortcut: a pinned section
 * holds its content still while the document scrolls, so its line has to
 * live in sticky space and be driven by that section's progress.
 */
export default function Spine({ d, mode = 'scroll', duration = 1.15 }: Props) {
  const root = useGsap<HTMLDivElement>((scope) => {
    const svg = scope.querySelector('svg') as SVGSVGElement | null
    const path = scope.querySelector('path') as SVGPathElement | null
    if (!svg || !path) return

    const trigger = scope.closest('section') ?? scope.parentElement
    let tween: gsap.core.Tween | null = null

    const build = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const sx = w / VW
      const sy = h / VH
      const top = TOP * sy
      const height = (BOTTOM - TOP) * sy

      /* Pixel space, 1:1 — no viewBox scaling, so a dash of length N is
         N pixels whichever direction the path is running. */
      svg.setAttribute('viewBox', `0 ${top} ${w} ${height}`)
      svg.style.top = `${top}px`
      svg.style.height = `${height}px`
      scope.style.top = `${top}px`
      /* The field must reach BELOW its section by however far the svg
         hangs past the viewport. A sticky element unsticks as soon as
         its bottom would leave its containing block — with the field
         ending at the section's bottom, the svg (which reaches 1100
         units below the fold) released more than a viewport early and
         from then on scrolled away with the section. That is the line
         "moving with the scroll after a point". */
      scope.style.bottom = `${-(BOTTOM - VH) * sy}px`
      path.setAttribute('d', toPixels(d, sx, sy))

      const len = path.getTotalLength()

      if (prefersReducedMotion()) {
        gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
        return
      }

      /* Whatever sits above the section's own top is drawn before the
         section is reached, so the overlap at a join is structural
         rather than a race between one section's tail and the next
         section's progress. */
      let lead = 0
      for (let l = 0; l <= len; l += 4) {
        if (path.getPointAtLength(l).y >= 0) {
          lead = l
          break
        }
      }

      tween?.scrollTrigger?.kill()
      tween?.kill()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len - lead })

      if (mode === 'intro') {
        tween = gsap.fromTo(
          path,
          { strokeDashoffset: len },
          { strokeDashoffset: 0, duration, ease: 'power2.inOut' }
        )
        return
      }

      if (!trigger) return
      tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger,
          /* Starts as the section enters from below rather than once it
             has topped out, or the stroke has not begun by the time the
             previous one leaves the bottom of the screen. */
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })
    }

    build()

    let id = 0
    const onResize = () => {
      window.clearTimeout(id)
      id = window.setTimeout(() => {
        build()
        ScrollTrigger.refresh()
      }, 140)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', onResize)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [d, mode])

  return (
    <div className={styles.field} ref={root} aria-hidden="true">
      <svg className={styles.spine} preserveAspectRatio="none">
        <path className={styles.path} d="" />
      </svg>
    </div>
  )
}
