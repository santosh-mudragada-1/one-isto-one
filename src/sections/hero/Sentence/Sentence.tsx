import { gsap, prefersReducedMotion } from '../../../lib/gsap'
import { sfx } from '../../../lib/sound'
import { useGsap } from '../../../lib/useGsap'
import Chrome from '../../../components/Chrome'
import styles from './Sentence.module.css'

const WORDS = ['logo', 'website', 'packaging', 'interior', 'product']
const FINAL = 'whole experience'

/**
 * 02 — THE SENTENCE THAT WON'T STAY STILL
 *
 * Signature interaction: the swapped word has a different width every
 * time, so the rest of the sentence is physically pushed along to make
 * room. Then the list stops pretending to be a list and resolves into
 * a single claim.
 */
export default function Sentence() {
  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const slot = q(`.${styles.slot}`)[0] as HTMLElement
    const words = q(`.${styles.word}`) as HTMLElement[]
    const ruler = q(`.${styles.measure}`)[0] as HTMLElement
    const pipFills = q(`.${styles.pipFill}`) as HTMLElement[]
    const dimmable = q(`.${styles.dim}`) as HTMLElement[]
    const sub = q(`.${styles.sub}`)[0] as HTMLElement

    const widthOf = (text: string) => {
      ruler.textContent = text
      return Math.ceil(ruler.getBoundingClientRect().width)
    }

    /* The ruler also fixes the slot's height, so the absolutely
       positioned words keep the same leading as every other line. */
    ruler.textContent = WORDS[0]
    const lineHeight = Math.ceil(ruler.getBoundingClientRect().height)
    gsap.set(slot, { height: lineHeight, width: widthOf(WORDS[0]) })

    let active = 0
    words[0].textContent = WORDS[0]
    gsap.set(words[0], { yPercent: 0, opacity: 1 })
    gsap.set(words[1], { yPercent: 110, opacity: 0 })

    if (reduced) {
      words[0].textContent = FINAL
      gsap.set(slot, { width: widthOf(FINAL) })
      gsap.set(q('.maskline > span'), { yPercent: 0 })
      gsap.set(sub, { opacity: 1 })
      gsap.set(pipFills, { scaleX: 1 })
      return
    }

    const swap = (text: string, final: boolean) => {
      const outgoing = words[active]
      const incoming = words[1 - active]
      incoming.textContent = text
      incoming.classList.toggle(styles.wordFinal, final)

      const tl = gsap.timeline()
      tl.to(
        slot,
        {
          width: widthOf(text),
          duration: final ? 0.85 : 0.62,
          ease: final ? 'power4.inOut' : 'power3.inOut',
        },
        0
      )
        .to(
          outgoing,
          { yPercent: -110, opacity: 0, duration: 0.42, ease: 'power3.in' },
          0
        )
        .fromTo(
          incoming,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: final ? 0.8 : 0.55,
            ease: 'power4.out',
          },
          0.07
        )
        .add(() => (final ? sfx.lock() : sfx.snap()), 0.2)

      active = 1 - active
      return tl
    }

    /* Entrance, then the cycle. */
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
    intro
      .from(q('.maskline > span'), {
        yPercent: 115,
        duration: 1.05,
        stagger: 0.09,
      })
      .from(slot, { opacity: 0, duration: 0.7 }, 0.2)
      .to(pipFills[0], { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0.6)

    const STEP = 1.25
    let step = 1

    const advance = () => {
      if (step < WORDS.length) {
        swap(WORDS[step], false)
        gsap.to(pipFills[step], { scaleX: 1, duration: 0.5, ease: 'power2.out' })
        step += 1
        gsap.delayedCall(STEP, advance)
      } else {
        /* The finale: the list stops being a list. */
        swap(FINAL, true)
        gsap.to(dimmable, { color: '#61615e', duration: 0.8, ease: 'power2.out' })
        gsap.to(pipFills, {
          scaleX: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: 'power2.out',
        })
        gsap.to(sub, { opacity: 1, duration: 0.9, delay: 0.45, ease: 'power3.out' })
        gsap.from(q(`.${styles.subRule}`), {
          scaleX: 0,
          duration: 0.9,
          delay: 0.45,
          ease: 'power4.out',
        })
      }
    }

    gsap.delayedCall(1.55, advance)
  }, [])

  return (
    <div className={styles.root} ref={root}>
      <Chrome tone="dark" />

      <div className={styles.content}>
        <h1 className={`display display--sm ${styles.head}`}>
          <span className={`maskline ${styles.dim}`}>
            <span>We design the</span>
          </span>

          <span className={styles.row}>
            <span className={styles.slot}>
              <span className={styles.word} />
              <span className={styles.word} />
            </span>
            <span className={`maskline ${styles.dim}`}>
              <span>your</span>
            </span>
          </span>

          <span className={`maskline ${styles.dim}`}>
            <span>customers remember.</span>
          </span>
        </h1>

        <p className={`${styles.sub} label`}>
          <span className={styles.subRule} />
          Not five suppliers. One studio.
        </p>

        <div className={styles.pips} aria-hidden="true">
          {WORDS.map((w) => (
            <span key={w} className={styles.pip}>
              <span className={styles.pipFill} />
            </span>
          ))}
        </div>
      </div>

      {/* the ruler inherits display type so measurements are exact */}
      <span className={`display display--sm ${styles.measure}`} aria-hidden="true" />
    </div>
  )
}
