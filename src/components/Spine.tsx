import { useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useGsap } from '../lib/useGsap'
import styles from './Spine.module.css'

type Props = {
  /** Path authored in a 1440×900 space and stretched to the viewport. */
  d: string
  /** Fires once, when the stroke reaches this fraction of its length. */
  onReach?: { at: number; run: () => void }
}

/**
 * THE SPINE
 *
 * One stroke, drawn once, running the length of the site — the device
 * Hero 04 is built on. It is not decoration and it is not a scroll
 * indicator: **it is the customer.** It never stops, which is the whole
 * reason the gaps in Section 02 cost anything. The business's work is
 * discontinuous; the person moving through it is not.
 *
 * Each section supplies the path for its own stretch. The stroke is
 * scrubbed by that section's scroll, so it arrives where the argument
 * needs it rather than on a clock of its own.
 */
export default function Spine({ d, onReach }: Props) {
  const fired = useRef(false)

  const root = useGsap<HTMLDivElement>((scope) => {
    const path = scope.querySelector('path')
    if (!path) return

    /* Scrubbed by the section this belongs to, not by the document —
       `html` is height:100%, so as a trigger it measures one viewport
       and the stroke would never advance. */
    const trigger = scope.closest('section') ?? scope.parentElement
    if (!trigger) return

    const len = (path as SVGPathElement).getTotalLength()

    if (prefersReducedMotion()) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
      onReach?.run()
      return
    }

    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          if (!onReach || fired.current) return
          if (self.progress >= onReach.at) {
            fired.current = true
            onReach.run()
          }
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      ScrollTrigger.refresh()
    }
  }, [d])

  return (
    <div ref={root}>
      <svg
        className={styles.spine}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.path} d={d} />
      </svg>
    </div>
  )
}
