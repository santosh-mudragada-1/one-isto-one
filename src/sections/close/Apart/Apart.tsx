import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './Apart.module.css'

/** Replace with the real address before launch. */
const EMAIL = 'hello@oneistoone.in'

/**
 * 06 · 01 — WHERE IT COMES APART
 *
 * The close. Back to ink, where the page started, so the last screen
 * and the first are the same room.
 *
 * Signature: the line STOPS. After fifteen screens the stroke comes
 * down, runs across the empty space under the sentence, and lands on
 * a 9px square — the colon dot the whole design system is built from.
 * Nothing else on this site ends, which is what makes an ending worth
 * scrolling to. The square is not animated to match the stroke: the
 * stroke marks it on arrival, so the two cannot disagree.
 *
 * The ask is deliberately the smallest one available. Not "book a
 * consultation" — tell us where it comes apart. Anyone who has read
 * Section 02 already knows their own answer, which means they can
 * write the email in one line.
 */
export default function Apart() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const rest = q(`.${styles.rest}`)

    if (reduced) {
      gsap.set(chars, { yPercent: 0 })
      gsap.set(rest, { opacity: 1 })
      return
    }

    gsap
      .timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })
      .from(chars, { ...HEADING_REVEAL }, 0)
      .to(rest, { opacity: 1, duration: 0.8, stagger: 0.25 }, 1.1)

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      className={styles.root}
      data-surface="dark"
      data-spine="close"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>06 — Start a conversation</span>

        <div className={styles.block}>
          <h2 className={`display display--sm ${styles.head}`}>
            <span className="maskline">
              <span>Tell us where</span>
            </span>
            {/* No full stop. The line brings it. */}
            <span className="maskline">
              <span>it comes apart</span>
            </span>
          </h2>

          {/* Where the line ends. Marked by the stroke, not by a timer. */}
          <span className={styles.stop} data-spine-end aria-hidden="true" />

          <p className={`${styles.rest} ${styles.note}`}>
            No deck and no pitch. One conversation, and we will tell you what
            we would ask you first.
          </p>

          <a className={`${styles.rest} ${styles.mail}`} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>

          <span className={`${styles.rest} ${styles.where} label`}>
            1:1 — India — 2026
          </span>
        </div>
      </div>
    </section>
  )
}
