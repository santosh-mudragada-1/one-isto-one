import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { sfx } from '../../../lib/sound'
import { useGsap } from '../../../lib/useGsap'
import styles from './Calendars.module.css'

/* Months are offsets from Jan 2024 across a 24-month track. Each
   supplier did good work, on time, in their own window. */
const MONTHS = 24
const SUPPLIERS = [
  { name: 'Brand agency', thing: 'the sign', from: 0, to: 4 },
  { name: 'Website agency', thing: 'the website', from: 5, to: 9 },
  { name: 'Interior designer', thing: 'the room', from: 7, to: 15 },
  { name: 'Marketing team', thing: 'the ads', from: 12, to: 17 },
  { name: 'Technology partner', thing: 'the booking', from: 15, to: 20 },
  { name: 'Growth consultant', thing: 'the emails', from: 19, to: 24 },
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const dateAt = (month: number) => {
  const m = gsap.utils.clamp(0, MONTHS - 0.01, month)
  const year = 2024 + Math.floor(m / 12)
  return `${MONTH_NAMES[Math.floor(m % 12)]} ${year}`
}

/** Where the customer line starts: late, after most of it shipped. */
const START_AT = 0.78

/**
 * 02 · 01 — SIX CALENDARS
 *
 * The Hero showed the two states at once, in space. This shows one of
 * them over time — because the pieces did not arrive together, they
 * arrived one at a time, over two years, each a reasonable decision.
 *
 * Signature: you drag one customer across the schedule. Wherever you
 * put them they meet a mixture of finished and unfinished work. There
 * is no position where the business is consistent.
 */
export default function Calendars() {
  const [pos, setPos] = useState(START_AT)
  const dragging = useRef(false)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const live = useRef(false)

  const month = pos * MONTHS

  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const bars = q(`.${styles.bar}`)
    const names = q(`.${styles.laneName}`)
    const durs = q(`.${styles.barDur}`)
    const customer = q(`.${styles.customer}`)
    const readout = q(`.${styles.readout}`)
    const close = q(`.${styles.close}`)

    if (reduced) {
      gsap.set(bars, { scaleX: 1 })
      gsap.set([durs, customer, readout], { opacity: 1 })
      live.current = true
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

    /* Each engagement lands in turn — the sequence is the argument. */
    tl.to(bars, { scaleX: 1, duration: 1, stagger: 0.55, ease: 'power2.out' }, 0)
      .to(names, { color: '#b9b9b3', duration: 0.8, stagger: 0.55 }, 0.1)
      .to(durs, { opacity: 1, duration: 0.6, stagger: 0.55 }, 0.35)

      /* …and then one person arrives and meets all of it at once. */
      .to(customer, { opacity: 1, duration: 0.5 }, 4.2)
      .to(readout, { opacity: 1, duration: 0.6 }, 4.4)
      .add(() => {
        live.current = true
        sfx.lock()
      }, 4.4)

      /* Ends unresolved: the schedule goes, the question stays. */
      .to(
        [bars, names, durs, customer, readout, q(`.${styles.head}`), q(`.${styles.scale}`)],
        { opacity: 0, duration: 0.6 },
        6.4
      )
      .to(close, { opacity: 1, duration: 0.7 }, 6.9)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  /* --- dragging the customer -------------------------------------- */
  const setFromPointer = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos(gsap.utils.clamp(0, 1, (clientX - r.left) / r.width))
  }

  const onDown = (e: React.PointerEvent) => {
    if (!live.current) return
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setFromPointer(e.clientX)
    sfx.snap()
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setFromPointer(e.clientX)
  }
  const onUp = () => {
    dragging.current = false
  }

  return (
    <section className={styles.root} ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>

        <h2 className={`display display--sm ${styles.head}`}>
          How a business actually gets built
        </h2>

        <div className={styles.chart}>
          <div className={`${styles.scale} label`}>
            <span>Jan 2024</span>
            <span>Two years</span>
            <span>Dec 2025</span>
          </div>

          {SUPPLIERS.map((s) => (
            <div className={styles.lane} key={s.name}>
              <span className={`${styles.laneName} label`}>{s.name}</span>
              <div className={styles.track}>
                <span
                  className={styles.bar}
                  style={{
                    left: `${(s.from / MONTHS) * 100}%`,
                    width: `${((s.to - s.from) / MONTHS) * 100}%`,
                  }}
                />
                <span
                  className={`${styles.barDur} label ${
                    s.to / MONTHS > 0.82 ? styles.barDurBefore : ''
                  }`}
                  style={{
                    left: `${
                      (s.to / MONTHS > 0.82 ? s.from / MONTHS : s.to / MONTHS) *
                      100
                    }%`,
                  }}
                >
                  {s.to - s.from} months
                </span>
              </div>
            </div>
          ))}

          {/* the one customer, crossing every lane at once */}
          <div
            className={styles.track}
            ref={trackRef}
            style={{
              position: 'absolute',
              left: 'clamp(120px, 15vw, 210px)',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'auto',
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <div className={styles.customer} style={{ left: `${pos * 100}%` }}>
              <span className={styles.customerCap} />
              <span className={`${styles.customerTag} label`}>
                One customer — drag
              </span>
            </div>
          </div>
        </div>

        <div className={styles.readout}>
          <span className={styles.readDate}>
            A customer walks in — {dateAt(month)}
          </span>
          <div className={styles.readList}>
            {SUPPLIERS.map((s) => {
              const done = month >= s.to
              return (
                <span
                  key={s.name}
                  className={`${styles.readItem} ${
                    done ? styles.stateNew : styles.stateOld
                  }`}
                >
                  <span className={styles.stateTag}>{done ? 'new' : 'old'}</span>
                  {s.thing}
                </span>
              )
            })}
          </div>
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Nobody was booked for the gaps.
        </h3>
      </div>
    </section>
  )
}
