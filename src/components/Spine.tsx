import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useGsap } from '../lib/useGsap'
import styles from './Spine.module.css'

type Props = {
  /** Path authored in a 1440×900 design space: y is a percentage of the
   *  viewport height, so 450 is 50vh and 594 is 66vh. */
  d: string
  /** `intro` draws once on load — the hero only.
   *
   *  Everywhere else the stroke is simply present, fully drawn. That is
   *  deliberate. Drawing it per-section meant two independent strokes
   *  had to meet exactly at every boundary, and that contract broke five
   *  different ways: the viewBox clipped what fell outside it, a wrapper
   *  isolated the blend, a stacking context trapped the z-index,
   *  anisotropic scaling corrupted the dash lengths, and sticky released
   *  a viewport early. With no front to synchronise, overlap is a
   *  property of the geometry and cannot come apart. */
  mode?: 'static' | 'intro'
  /** Intro only. Kept short: a visitor who scrolls before the stroke has
   *  finished should never meet a line that starts mid-air. */
  duration?: number
}

/** Design space the paths are written in. */
const VW = 1440
const VH = 900
/** Headroom above a section's top, and reach below its bottom. */
const TOP = -400
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
export default function Spine({ d, mode = 'static', duration = 1.15 }: Props) {
  const root = useGsap<HTMLDivElement>((scope) => {
    const svg = scope.querySelector('svg') as SVGSVGElement | null
    const path = scope.querySelector('path') as SVGPathElement | null
    if (!svg || !path) return

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

      tween?.kill()

      if (mode === 'intro' && !prefersReducedMotion()) {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len })
        tween = gsap.fromTo(
          path,
          { strokeDashoffset: len },
          { strokeDashoffset: 0, duration, ease: 'power2.inOut' }
        )
        return
      }

      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
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
