import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { sfx } from '../../../lib/sound'
import { useGsap } from '../../../lib/useGsap'
import styles from './Seams.module.css'

/* Six almost-identical off-whites. Every one of them was signed off as
   correct, and no two of them match — which is how this actually fails
   in the real world, rather than in a diagram. */
const PANELS = [
  { by: 'Brand agency', tone: '#edede9' },
  { by: 'Website agency', tone: '#e8e7e2' },
  { by: 'Interior designer', tone: '#f1f0ec' },
  { by: 'Marketing team', tone: '#e5e4df' },
  { by: 'Technology partner', tone: '#efeeea' },
  { by: 'Growth consultant', tone: '#eae9e3' },
]

/* Gaps measured in the currency they actually failed in. */
const SEAMS = ['3 emails', '2 weeks', '1 assumption', 'nobody asked', 'a different month']

/** The join that opens at the end. */
const OPENS = 2

/**
 * 02 · 05 — THE SEAMS
 *
 * Signature: the joins stay visible after the pieces close. From
 * across the street it is one building; the customer stands at the
 * door. You only notice the seams because you were shown them once —
 * which is precisely what happens to a customer.
 */
export default function Seams() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const panels = q(`.${styles.panel}`) as HTMLElement[]
    const names = q(`.${styles.panelName}`) as HTMLElement[]
    const seams = q(`.${styles.seam}`) as HTMLElement[]
    const notes = q(`.${styles.seamNote}`) as HTMLElement[]
    const head = q(`.${styles.head}`)
    const close = q(`.${styles.close}`)

    if (reduced) {
      gsap.set([seams, notes, head], { opacity: 1 })
      return
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    /* It reads as one object. Then it comes apart, and every piece
       turns out to have had an author. */
    tl.to(head, { opacity: 1, duration: 0.5 }, 0.2)

    panels.forEach((p, i) => {
      const spread = (i - (PANELS.length - 1) / 2) * 34
      tl.to(p, { x: spread, duration: 1.4, ease: 'power2.inOut' }, 0.4)
        .to(names[i], { opacity: 1, duration: 0.5 }, 0.9 + i * 0.08)
    })
    tl.add(() => sfx.slide(), 0.4)

    /* And then it closes again — and the joins do not go away. */
    panels.forEach((p) => {
      tl.to(p, { x: 0, duration: 1.5, ease: 'power3.inOut' }, 2.6)
    })
    tl.to(names, { opacity: 0, duration: 0.5 }, 2.6)
      .to(seams, { opacity: 1, duration: 0.5, stagger: 0.08 }, 3.7)
      .to(notes, { opacity: 1, duration: 0.5, stagger: 0.08 }, 3.9)
      .add(() => sfx.lock(), 3.9)

    /* One join opens until it is the only thing on screen. */
    tl.to([notes, head], { opacity: 0, duration: 0.4 }, 5.4)
      /* The join opens past the edges of the frame in both axes, so it
         becomes the only thing on screen rather than a wide bar with
         the object still showing around it. */
      .to(
        seams[OPENS],
        {
          width: '220vw',
          height: '130vh',
          top: '-15vh',
          duration: 1.5,
          ease: 'power3.in',
        },
        5.6
      )
      .to(close, { opacity: 1, duration: 0.6 }, 7.15)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section className={styles.root} ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>
        <h2 className={`display display--sm ${styles.head}`}>
          One building. Six makers.
        </h2>

        <div className={styles.stage}>
          {PANELS.map((p, i) => (
            <div
              key={p.by}
              className={styles.panel}
              style={{ left: `${i * 16.6667}%`, background: p.tone }}
            >
              <span className={`${styles.panelName} label`}>{p.by}</span>
            </div>
          ))}

          {SEAMS.map((s, i) => (
            <span
              key={s}
              className={`${styles.seam} ${i === OPENS ? styles.seamWide : ''}`}
              style={{ left: `${(i + 1) * 16.6667}%` }}
            >
              <span className={`${styles.seamNote} label`}>{s}</span>
            </span>
          ))}
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Your customer stands at the door.
        </h3>
      </div>
    </section>
  )
}
