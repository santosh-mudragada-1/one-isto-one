import { useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import styles from './Rewrite.module.css'

/* Every rewrite is defensible. Every one is a small professional
   improvement. Six small professional improvements later it means
   something else entirely. */
const BEATS = [
  {
    holder: 'The owner, on a napkin',
    line: 'Warm, a bit rough around the edges, somewhere you’d stay too long.',
    lost: null,
  },
  {
    holder: 'The brand agency',
    line: 'Warm, characterful, with an edge.',
    lost: 'rough around the edges · somewhere you’d stay too long',
  },
  {
    holder: 'The website agency',
    line: 'Modern. Clean. Minimal.',
    lost: 'warm · characterful',
  },
  {
    holder: 'The interior designer',
    line: 'Industrial minimalism.',
    lost: 'modern · clean',
  },
  {
    holder: 'The marketing team',
    line: 'Bold. Disruptive. Unmissable.',
    lost: 'minimalism · restraint',
  },
  {
    holder: 'The growth consultant',
    line: 'Optimised for conversion.',
    lost: 'everything the owner said',
  },
]

const ORIGINAL = BEATS[0].line

/**
 * 02 · 03 — THE REWRITE
 *
 * Signature: the last beat. After the sixth version, the owner's own
 * sentence returns underneath it at half the size and the two sit
 * together in silence. Nothing comments on it. That silence does more
 * than a headline could.
 */
export default function Rewrite() {
  const [active, setActive] = useState(0)

  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const beats = q(`.${styles.beat}`) as HTMLElement[]
    const origin = q(`.${styles.origin}`)
    const close = q(`.${styles.close}`)

    if (reduced) {
      gsap.set(beats[beats.length - 1], { opacity: 1 })
      gsap.set(origin, { opacity: 1 })
      setActive(BEATS.length - 1)
      return
    }

    gsap.set(beats[0], { opacity: 1 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    /* Each version replaces the last in the same position — the point
       is which words disappear, not that a new sentence arrived. */
    BEATS.forEach((_, i) => {
      if (i === 0) return
      tl.to(beats[i - 1], { opacity: 0, y: -26, duration: 0.5 }, i - 1 + 0.55)
        .fromTo(
          beats[i],
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          i - 1 + 0.7
        )
        .add(() => {
          setActive(i)
        }, i - 1 + 0.7)
    })

    /* The owner's sentence comes back and stands next to the result. */
    tl.to(origin, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 5.4)
      .to([beats[BEATS.length - 1], origin], { opacity: 0, duration: 0.6 }, 7.0)
      .to(close, { opacity: 1, duration: 0.7 }, 7.4)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section className={styles.root} ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>

        <div className={styles.stack}>
          {BEATS.map((b) => (
            <div className={styles.beat} key={b.holder}>
              <span className={`${styles.holder} label`}>
                <span className={styles.holderRule} />
                {b.holder}
              </span>
              <p className={`display display--sm ${styles.line}`}>{b.line}</p>
              {b.lost && (
                <span className={`${styles.lost} label`}>Lost — {b.lost}</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.origin}>
          <span className={`${styles.originLabel} label`}>
            What the owner actually said
          </span>
          <p className={styles.originLine}>{ORIGINAL}</p>
        </div>

        <div className={styles.pips} aria-hidden="true">
          {BEATS.map((b, i) => (
            <span
              key={b.holder}
              className={`${styles.pip} ${i <= active ? styles.pipOn : ''}`}
            />
          ))}
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Nobody wrote it down wrong. It just kept getting better.
        </h3>
      </div>
    </section>
  )
}
