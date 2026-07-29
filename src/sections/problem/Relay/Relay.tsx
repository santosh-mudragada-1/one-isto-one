import { useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import styles from './Relay.module.css'

const STATIONS = [
  'Brand agency',
  'Website agency',
  'Interior designer',
  'Marketing team',
  'Technology partner',
  'Growth consultant',
]

/* One casualty per handover. None of them appeared on anyone's scope
   of work, which is exactly why each was safe to drop. */
const LOST = [
  'why the name meant something',
  'the colour that was in the logo',
  'the quiet the room was for',
  'how the writing sounded',
  'the person it was all for',
]

const x = (i: number) => 6 + (i * 88) / (STATIONS.length - 1)
const mid = (i: number) => (x(i) + x(i + 1)) / 2

/**
 * 02 · 02 — THE RELAY
 *
 * Signature: the gain is loud and the loss is quiet. Every station
 * fills another cell of the object — visible, paid for, approved —
 * while something slips off between stations and lands on a shelf
 * nobody is looking at. By the end the work is complete and five
 * things are missing.
 */
export default function Relay() {
  const [filled, setFilled] = useState(0)

  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const obj = q(`.${styles.object}`)[0] as HTMLElement
    const crumbs = q(`.${styles.crumb}`) as HTMLElement[]
    const lost = q(`.${styles.lostItem}`) as HTMLElement[]
    const names = q(`.${styles.stationName}`) as HTMLElement[]
    const close = q(`.${styles.close}`)

    if (reduced) {
      setFilled(STATIONS.length)
      gsap.set([crumbs, lost], { opacity: 1 })
      gsap.set(crumbs, { y: 0 })
      gsap.set(obj, { left: `${x(STATIONS.length - 1)}%` })
      return
    }

    gsap.set(obj, { left: `${x(0)}%` })
    gsap.set(crumbs, { opacity: 0, y: -40 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    STATIONS.forEach((_, i) => {
      /* arrive, and be worked on */
      if (i > 0) {
        tl.to(obj, { left: `${x(i)}%`, duration: 1, ease: 'none' }, i - 1)
      }
      tl.add(() => {
        setFilled(i + 1)
      }, i)
      tl.to(names[i], { color: '#edede9', duration: 0.4 }, i)
      tl.to(names[i], { color: '#61615e', duration: 0.6 }, i + 0.75)

      /* leave, and drop something on the way out */
      if (i < LOST.length) {
        tl.to(
          crumbs[i],
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.in' },
          i + 0.4
        ).to(lost[i], { opacity: 1, duration: 0.5 }, i + 0.9)
      }
    })

    /* The work is finished. The shelf is not empty. The section
       headline clears out so the closing line has the frame alone. */
    tl.to(
      [
        obj,
        ...names,
        ...q(`.${styles.station}`),
        q(`.${styles.rail}`),
        q(`.${styles.head}`),
      ],
      { opacity: 0, duration: 0.6 },
      6.4
    ).to(close, { opacity: 1, duration: 0.7 }, 6.8)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section className={styles.root} ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>
        <h2 className={`display display--sm ${styles.head}`}>
          Every handover costs something
        </h2>

        <div className={styles.stage}>
          <span className={styles.rail} />

          {STATIONS.map((s, i) => (
            <span key={s}>
              <span className={styles.station} style={{ left: `${x(i)}%` }} />
              <span
                className={`${styles.stationName} label`}
                style={{ left: `${x(i)}%` }}
              >
                {s}
              </span>
            </span>
          ))}

          {/* the thing being passed along */}
          <div className={styles.object}>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className={`${styles.cell} chamfer ${
                  i < filled ? styles.cellDone : ''
                }`}
              />
            ))}
          </div>

          {/* what slipped out between hands */}
          {LOST.map((l, i) => (
            <span
              key={l}
              className={styles.crumb}
              style={{ left: `${mid(i)}%`, top: '62%' }}
            />
          ))}

          <div className={styles.shelf}>
            <span className={`${styles.shelfHead} label`}>
              What fell off along the way
            </span>
            <div className={`${styles.lost} label`}>
              {LOST.map((l) => (
                <span key={l} className={styles.lostItem}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Finished. And missing five things.
        </h3>
      </div>
    </section>
  )
}
