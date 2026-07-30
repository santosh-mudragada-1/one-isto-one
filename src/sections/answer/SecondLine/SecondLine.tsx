import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './SecondLine.module.css'

/* Five ties, not five services. Each one names a place where the two
   lines are held together, and answers — quietly — one of the five
   joins that came apart in Section 02. */
const TIES = [
  {
    num: '01',
    name: 'Brand Experience',
    sub: 'What it means, before anyone has to ask.',
  },
  {
    num: '02',
    name: 'Product Experience',
    sub: 'The thing itself, and how it feels to hold.',
  },
  {
    num: '03',
    name: 'Digital Experience',
    sub: 'Every screen, in the same voice.',
  },
  {
    num: '04',
    name: 'Spatial Experience',
    sub: 'The room, agreeing with the sign outside.',
  },
  {
    num: '05',
    name: 'Growth Systems',
    sub: 'What happens after opening week.',
  },
]

/**
 * 03 · 01 — THE SECOND LINE
 *
 * Answers "so what does 1:1 actually do?" without listing anything.
 * A second stroke arrives, matches pace, and never leaves — and two
 * lines held at a constant gap is the mark itself, so the philosophy,
 * the logo and the navigation become one object.
 *
 * The relief is structural: the visitor has been alone on this line for
 * two sections. Nothing here says "we see the whole picture." Something
 * simply turns up and walks the rest of it.
 */
export default function SecondLine() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const arrive = q(`.${styles.arrive}`)
    const descend = q(`.${styles.descend}`)
    const sub = q(`.${styles.sub}`)
    const ties = q(`.${styles.tie}`) as HTMLElement[]
    const rungs = q(`.${styles.rung}`) as HTMLElement[]
    const head = q(`.${styles.head}`)
    const close = q(`.${styles.close}`)

    if (reduced) {
      gsap.set([arrive, descend, ...rungs], { scaleX: 1, scaleY: 1 })
      gsap.set([sub, ...ties, close], { opacity: 1 })
      gsap.set(chars, { yPercent: 0 })
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

    /* The claim, then the thing that makes it true. */
    tl.from(
      chars,
      { ...HEADING_REVEAL },
      0
    )

      /* Someone crosses the frame and turns to run beside you. Slow on
         purpose — arriving in a hurry would read as a pitch. */
      .to(arrive, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.5)
      .to(descend, { scaleY: 1, duration: 1.5, ease: 'power2.out' }, 1.55)
      .to(sub, { opacity: 1, duration: 0.7 }, 1.9)

    /* One tie per beat. Never more than one thing arriving at a time —
       five cards appearing together is the overwhelm this section was
       written to avoid. */
    TIES.forEach((_, i) => {
      const at = 2.7 + i * 0.62
      tl.to(ties[i], { opacity: 1, duration: 0.55, ease: 'power2.out' }, at).to(
        rungs[i],
        { scaleX: 1, duration: 0.5, ease: 'power3.out' },
        at + 0.12
      )
    })

    /* Everything named steps aside and leaves the two lines running
       side by side — which is the image the next section should open
       from. The closing line then has the frame to itself. */
    tl.to(q(`.${styles.content}`), { opacity: 0, duration: 0.6 }, 6.3)
      .to(close, { opacity: 1, duration: 0.7 }, 6.8)

    void head
    void sub

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      className={styles.root}
      data-surface="light"
      data-spine="second-line"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>03 — What we do</span>

        <span className={styles.arrive} aria-hidden="true" />
        <span className={styles.descend} aria-hidden="true" />

        <div className={styles.content}>
          <h2 className={`display display--sm ${styles.head}`}>
            <span className="maskline">
              <span>One of these</span>
            </span>
            <span className="maskline">
              <span>lines is us.</span>
            </span>
          </h2>
          <p className={`${styles.sub} label`}>
            Same route. Same pace. The whole way.
          </p>

          <ul className={styles.ties}>
            {TIES.map((t) => (
              <li className={styles.tie} key={t.num}>
                <span className={styles.tieNum}>{t.num}</span>
                <span className={styles.tieName}>{t.name}</span>
                <span className={`${styles.tieSub} label`}>{t.sub}</span>
                <span className={styles.rung} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Holding it is the easy half.
        </h3>
      </div>
    </section>
  )
}
