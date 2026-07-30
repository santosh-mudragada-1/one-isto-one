import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './Notebook.module.css'

/* Four entries. One confident, one they stopped believing, one they
   still hold, one unfinished. The wrong one is the point: nothing else
   on this site is unresolved, so leaving it in is the only unguarded
   thing here — and unguarded is what earns trust when there is no work
   to show. */
const ENTRIES = [
  {
    date: '12.03.25',
    body: 'The sign should be the last thing we design, not the first. It is the only part a customer reads twice.',
  },
  {
    date: '04.04.25',
    body: 'Every business has one hero object. Find it and everything else follows.',
    struck: true,
    aside: 'Did not survive contact with a restaurant. Nothing followed.',
  },
  {
    date: '19.05.25',
    body: 'A good room can apologise for a bad website. A website cannot apologise for a bad room.',
  },
  {
    date: '02.07.25',
    body: 'We keep coming back to the receipt. Nobody designs the receipt. Everybody reads it—',
    open: true,
  },
]

/**
 * 04 · 01 — THE NOTEBOOK
 *
 * The section that carries the whole trust burden, because there is no
 * work to show. It cannot rest on evidence, so it demonstrates thinking
 * instead of asserting it: dated entries, in the studio's own voice,
 * including one they stopped believing and one that stops mid-sentence.
 *
 * Signature: visible incompleteness. Everything else here is resolved,
 * which is exactly why an unresolved thing reads as the only moment
 * nobody tidied.
 */
export default function Notebook() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const chars = headingChars(scope)
    const entries = q(`.${styles.entry}`) as HTMLElement[]
    const strike = q(`.${styles.strike}`)
    const aside = q(`.${styles.aside}`)
    const caret = q(`.${styles.caret}`)[0] as HTMLElement

    if (reduced) {
      gsap.set(chars, { yPercent: 0 })
      gsap.set([...entries, aside, caret], { opacity: 1 })
      gsap.set(strike, { scaleX: 1 })
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

    tl.from(chars, { ...HEADING_REVEAL }, 0)

    /* One entry per beat. Read down, never driven past. */
    ENTRIES.forEach((e, i) => {
      const at = 1.4 + i * 1.15
      tl.to(entries[i], { opacity: 1, duration: 0.7, ease: 'power2.out' }, at)

      if (e.struck) {
        /* The strike lands after you have had time to agree with it. */
        tl.to(strike, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, at + 0.75)
          .to(aside, { opacity: 1, duration: 0.5 }, at + 1.05)
      }
    })

    /* And it just stops. The caret keeps its own time so it reads as a
       thought still open rather than an animation that ended. */
    tl.to(caret, { opacity: 1, duration: 0.3 }, 1.4 + ENTRIES.length * 1.15)

    gsap.to(caret, {
      opacity: 0,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)',
      delay: 0.4,
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      className={styles.root}
      data-surface="dark"
      data-spine="thinking"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>04 — How we think</span>

        <h2 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>We leave the wrong ones in.</span>
          </span>
        </h2>

        <div className={styles.entries}>
          {ENTRIES.map((e) => (
            <div
              className={`${styles.entry} ${e.struck ? styles.struck : ''}`}
              key={e.date}
            >
              <span className={`${styles.date} label`}>{e.date}</span>
              <p className={styles.body}>
                {e.body}
                {e.open && <span className={styles.caret} aria-hidden="true" />}
                {e.struck && <span className={styles.strike} aria-hidden="true" />}
              </p>
              {e.aside && <span className={`${styles.aside} label`}>{e.aside}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
