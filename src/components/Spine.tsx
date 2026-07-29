import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useGsap } from '../lib/useGsap'
import styles from './Spine.module.css'

type Props = {
  /** Path authored in a 1440×900 space and stretched to the viewport,
   *  so y is a percentage of viewport height: 450 = 50vh, 594 = 66vh. */
  d: string
}

/**
 * THE SPINE
 *
 * One stroke running the length of the site — the device Hero 04 is
 * built on. It is not decoration and not a scroll indicator:
 * **it is the customer.** It never stops, which is the whole reason the
 * gaps in Section 02 cost anything. The business's work is
 * discontinuous; the person moving through it is not.
 *
 * Each section supplies its own stretch and hands off at the same x, so
 * the stroke is continuous across a section boundary even though it is
 * drawn per-section. Per-section is not a shortcut — a pinned section
 * holds its content still while the document scrolls, so the line has
 * to be drawn in viewport space and driven by that section's progress.
 */
export default function Spine({ d }: Props) {
  const root = useGsap<HTMLDivElement>((scope) => {
    const svg = scope.querySelector('svg')
    const path = scope.querySelector('path')
    if (!svg || !path) return

    /* Scrubbed by the section this belongs to, not by the document —
       `html` is height:100%, so as a trigger it measures one viewport
       and the stroke would never advance. */
    const trigger = scope.closest('section') ?? scope.parentElement
    if (!trigger) return

    const len = (path as SVGPathElement).getTotalLength()

    if (prefersReducedMotion()) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
      return
    }

    void svg
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger,
        /* Starts as the section enters from below, not once it has
           topped out — otherwise the stroke has not begun by the time
           the previous section's stroke leaves the bottom of the
           screen, and the line visibly breaks at the join. */
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ScrollTrigger.refresh()
    }
  }, [d])

  return (
    <div className={styles.field} ref={root} aria-hidden="true">
      <svg
        className={styles.spine}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path className={styles.path} d={d} />
      </svg>
    </div>
  )
}
