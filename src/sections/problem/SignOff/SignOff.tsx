import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import styles from './SignOff.module.css'

const ROWS = [
  { work: 'Identity and signage', by: 'Brand agency', on: '03 / 24' },
  { work: 'Website', by: 'Website agency', on: '09 / 24' },
  { work: 'The room', by: 'Interior designer', on: '02 / 25' },
  { work: 'Launch campaign', by: 'Marketing team', on: '04 / 25' },
  { work: 'Booking and systems', by: 'Technology partner', on: '07 / 25' },
  { work: 'Growth plan', by: 'Growth consultant', on: '11 / 25' },
]

/**
 * 02 · 04 — THE SIGN-OFF SHEET
 *
 * Every row was approved. Every supplier delivered. Then a seventh row
 * that was never on anyone's contract.
 *
 * Signature: you can try to sign it. The box refuses. The visitor
 * physically attempts to close the problem and is not allowed to —
 * which is the difference between understanding this and recognising it.
 */
export default function SignOff() {
  const [refused, setRefused] = useState(false)
  const armed = useRef(false)
  const boxRef = useRef<HTMLButtonElement | null>(null)

  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const ticks = q(`.${styles.tick}`) as unknown as SVGElement[]
    const stamps = q(`.${styles.stamp}`) as HTMLElement[]
    const rows = q(`.${styles.row}`) as HTMLElement[]
    const open = q(`.${styles.rowOpen}`)[0] as HTMLElement
    const caret = q(`.${styles.caret}`)[0] as HTMLElement
    const refusal = q(`.${styles.refusal}`)
    const close = q(`.${styles.close}`)
    const sheet = q(`.${styles.sheet}`)

    if (reduced) {
      gsap.set([ticks, stamps, open], { opacity: 1 })
      armed.current = true
      return
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })

    /* Six rows close, one per beat. Each one is fine. */
    ROWS.forEach((_, i) => {
      tl.to(ticks[i], { opacity: 1, duration: 0.28, ease: 'power2.out' }, i * 0.8)
        .to(stamps[i], { opacity: 1, duration: 0.28 }, i * 0.8 + 0.06)
        .fromTo(
          rows[i],
          { color: '#edede9' },
          { color: '#61615e', duration: 0.7 },
          i * 0.8
        )
    })

    /* And then the row that was never anybody's job. */
    tl.to(open, { opacity: 1, duration: 0.6, ease: 'power3.out' }, 5.1)
      .add(() => {
        armed.current = true
      }, 5.1)

    /* It waits. Nothing signs it. */
    tl.to(
      caret,
      { opacity: 0, duration: 0.4, repeat: 6, yoyo: true, ease: 'none' },
      5.4
    )

    tl.to(sheet, { opacity: 0, duration: 0.7 }, 7.6).to(
      close,
      { opacity: 1, duration: 0.7 },
      8.0
    )

    /* Keep the caret blinking on its own clock too, so it reads as
       waiting for input rather than as part of the scroll. */
    gsap.to(caret, {
      opacity: 0,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)',
      delay: 0.2,
    })

    void refusal
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const trySign = () => {
    if (!armed.current) return
    setRefused(true)

    const el = boxRef.current
    if (el && !prefersReducedMotion()) {
      /* A small, flat refusal. Not a bounce — the form simply does not
         accept a signature it has no name for. */
      gsap.fromTo(
        el,
        { x: -3 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.35)' }
      )
    }
    const note = document.querySelector<HTMLElement>(`.${styles.refusal}`)
    if (note) gsap.to(note, { opacity: 1, duration: 0.4 })
    const owner = document.querySelector<HTMLElement>(`.${styles.noOwner}`)
    if (owner) gsap.to(owner, { opacity: 1, duration: 0.4 })
  }

  return (
    <section className={styles.root} ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>

        <div className={styles.sheet}>
          <div className={`${styles.sheetHead} label`}>
            <span>Project sign-off</span>
            <span>Everything below was approved</span>
          </div>

          <div className={styles.cols}>
            <span>Deliverable</span>
            <span>Supplier</span>
            <span>Approved</span>
          </div>

          {ROWS.map((r) => (
            <div className={styles.row} key={r.work}>
              <span className={styles.deliverable}>{r.work}</span>
              <span className={styles.supplier}>{r.by}</span>
              <span className={styles.approved}>
                <svg className={styles.tick} viewBox="0 0 24 24">
                  <path d="M4 12.5l5.5 5.5L20 6.5" />
                </svg>
                <span className={styles.stamp}>{r.on}</span>
              </span>
            </div>
          ))}

          {/* the row that was never on anyone's contract */}
          <div className={`${styles.row} ${styles.rowOpen}`}>
            <span className={styles.deliverable}>
              The way it all feels together
            </span>
            <span className={`${styles.supplier} ${styles.noOwner}`}>
              — no owner assigned —
            </span>
            <span className={styles.approved}>
              <button
                ref={boxRef}
                className={`${styles.box} chamfer`}
                onClick={trySign}
                aria-label="Approve — the way it all feels together"
                aria-disabled={refused}
              >
                <span className={styles.caret} />
              </button>
            </span>
          </div>
        </div>

        <span className={`${styles.refusal} label`}>
          There is no signature line for this. There never was.
        </span>

        <h3 className={`display display--sm ${styles.close}`}>
          Everyone did their job.
        </h3>
      </div>
    </section>
  )
}
