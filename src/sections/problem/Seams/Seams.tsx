import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { splitChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon from '../../../components/PixelIcon'
import styles from './Seams.module.css'

/* Six off-whites that do not match. The spread is deliberately wide
   enough to SEE — an earlier pass held them within 5% lightness, which
   made the mismatch carrying the whole argument invisible and left the
   panels reading as empty image slots.
   Each panel also holds the thing that maker actually delivered. */
const PANELS = [
  { by: 'Brand agency', made: 'the sign', tone: '#f4f3ef', icon: 'sign' },
  { by: 'Website agency', made: 'the website', tone: '#e2e1db', icon: 'browser' },
  { by: 'Interior designer', made: 'the room', tone: '#efeee9', icon: 'chair' },
  { by: 'Marketing team', made: 'the ads', tone: '#d9d8d2', icon: 'horn' },
  { by: 'Technology partner', made: 'the booking', tone: '#eae9e3', icon: 'terminal' },
  { by: 'Growth consultant', made: 'the emails', tone: '#dedcd6', icon: 'chart' },
] as const

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
    const ticks = q(`.${styles.tick}`) as HTMLElement[]
    const notes = q(`.${styles.seamNote}`) as HTMLElement[]
    const crossNote = q(`.${styles.crossNote}`)
    const head = q(`.${styles.head}`)
    /* Only the section heading, not the closing line — the close lands
       over a blackout, where a per-character stagger would be lost. */
    const headChars = (head[0] as HTMLElement)
      ? Array.from(
          (head[0] as HTMLElement).querySelectorAll<HTMLElement>('.maskline > span')
        ).flatMap((l) => splitChars(l))
      : []
    const close = q(`.${styles.close}`)
    const pixels = Array.from(scope.querySelectorAll('[data-px]'))

    if (reduced) {
      gsap.set([seams, ticks, notes, crossNote, head], { opacity: 1 })
      gsap.set(headChars, { yPercent: 0 })
      gsap.set(pixels, { scale: 1, opacity: 1 })
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
    tl.to(head, { opacity: 1, duration: 0.5 }, 0.2).from(
      headChars,
      { ...HEADING_REVEAL },
      0.25
    )

    panels.forEach((p, i) => {
      const spread = (i - (PANELS.length - 1) / 2) * 34
      tl.to(p, { x: spread, duration: 1.4, ease: 'power2.inOut' }, 0.4)
        .to(names[i], { opacity: 1, duration: 0.5 }, 0.9 + i * 0.08)
    })

    /* As the pieces come apart, what each maker actually built resolves
       inside their panel — cell by cell, in no particular order, the way
       a low-resolution thing arrives. */
    tl.from(
      pixels,
      {
        scale: 0,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: { amount: 1.25, from: 'random' },
      },
      0.7
    )

    /* And then it closes again — and the joins do not go away. */
    panels.forEach((p) => {
      tl.to(p, { x: 0, duration: 1.5, ease: 'power3.inOut' }, 2.6)
    })
    tl.to(names, { opacity: 0, duration: 0.5 }, 2.6)
      .to([...seams, ...ticks], { opacity: 1, duration: 0.5, stagger: 0.04 }, 3.7)
      .to(notes, { opacity: 1, duration: 0.5, stagger: 0.08 }, 3.9)
      /* Names what the line is, once it has finished crossing —
         otherwise the stroke reads as decoration, not as a person. */
      .to(crossNote, { opacity: 1, duration: 0.6 }, 4.3)

    /* One join opens until it is the only thing on screen. */
    tl.to([notes, ticks, crossNote, head], { opacity: 0, duration: 0.4 }, 5.4)
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
    <section
      className={styles.root}
      data-surface="dark"
      data-spine="seams"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>02 — The problem</span>
        <h2 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>One building.</span>
          </span>
          <span className="maskline">
            <span>Six makers.</span>
          </span>
        </h2>

        <div className={styles.stage}>
          {PANELS.map((p, i) => (
            <div
              key={p.by}
              className={styles.panel}
              style={{ left: `${i * 16.6667}%`, background: p.tone }}
            >
              <PixelIcon name={p.icon} className={styles.work} />
              <span className={`${styles.panelName} label`}>
                {p.by}
                <span className={styles.panelMade}>{p.made}</span>
              </span>
            </div>
          ))}

          {SEAMS.map((s, i) => (
            <span key={s}>
              <span
                className={`${styles.seam} ${i === OPENS ? styles.seamWide : ''}`}
                style={{ left: `${(i + 1) * 16.6667}%` }}
              >
                <span className={`${styles.seamNote} label`}>{s}</span>
              </span>
              {/* the same join, cutting the path below */}
              <span
                className={styles.tick}
                style={{ left: `${(i + 1) * 16.6667}%` }}
              />
            </span>
          ))}

          <span className={`${styles.crossNote} label`}>
            Your customer crosses every one of these without stopping
          </span>
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Your customer stands at the door.
        </h3>
      </div>
    </section>
  )
}
