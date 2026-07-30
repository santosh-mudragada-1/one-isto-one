import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './Questions.module.css'

/* Five things a single-discipline supplier has no reason to ask, and
   every one of them decides something. Short, concrete, and answerable
   by the owner in one breath — that is the proof. Explaining how we
   think would be a paragraph nobody believes; the questions ARE the
   thinking, so there is nothing to explain. */
const ASKED = [
  'Which door do people actually use?',
  'What does your busiest hour sound like?',
  'What do people photograph?',
  'Who says your name out loud?',
  'What is the first thing you throw away?',
]

/**
 * 04 · 02 — THE QUESTIONS
 *
 * Signature: the answer line. Every question arrives with an empty
 * rule under it and the rule is never filled — because the answers are
 * yours, and this is a page, not a form. What the visitor is left
 * looking at is a sheet of their own business with the blanks open.
 *
 * There is no body copy in this section at all. A studio with no work
 * to show cannot afford to describe its thinking; it has to do some in
 * front of you.
 */
export default function Questions() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const asks = q(`.${styles.ask}`) as HTMLElement[]
    const rules = q(`.${styles.rule}`) as HTMLElement[]
    const note = q(`.${styles.note}`)

    if (reduced) {
      gsap.set(chars, { yPercent: 0 })
      gsap.set([...asks, ...note], { opacity: 1, y: 0 })
      gsap.set(rules, { scaleX: 1 })
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

    /* One question, then the rule it leaves open, then the next. The
       rule draws rather than fades: it is a line being ruled. */
    ASKED.forEach((_, i) => {
      const at = 1 + i * 0.9
      tl.to(asks[i], { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, at)
        .to(rules[i], { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, at + 0.18)
    })

    tl.to(note, { opacity: 1, duration: 0.6 }, 1 + ASKED.length * 0.9)

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
            <span>We ask first.</span>
          </span>
        </h2>

        <ol className={styles.sheet}>
          {ASKED.map((a) => (
            <li className={styles.line} key={a}>
              <span className={styles.ask}>{a}</span>
              <span className={styles.rule} aria-hidden="true" />
            </li>
          ))}
        </ol>

        <span className={`${styles.note} label`}>The blanks are yours</span>
      </div>
    </section>
  )
}
