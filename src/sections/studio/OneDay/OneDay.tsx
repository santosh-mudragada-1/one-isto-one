import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import styles from './OneDay.module.css'

/* One customer, one ordinary day. Not personas, not a funnel — six
   things that actually happen to one person, in the order they happen.
   A restaurant owner recognises every one of them without being told
   what they are called. */
const MOMENTS = [
  { at: '07.40', what: 'She looks you up on her phone, still in bed.' },
  { at: '09.15', what: 'She walks past your sign and reads it once.' },
  { at: '12.30', what: 'She sits down in the room you built.' },
  { at: '12.55', what: 'She reads the menu, and the prices.' },
  { at: '13.20', what: 'She pays, and reads the receipt.' },
  { at: '20.00', what: 'She gets the email you sent everyone.' },
]

/**
 * 05 · 01 — ONE DAY
 *
 * Section 02 put six different makers under six pieces. This puts the
 * same six moments under ONE name, six times, and lets the repetition
 * make the argument. Nobody has to be told what "end-to-end" means if
 * they can see the same mark under every hour of a Tuesday.
 *
 * Signature: the day travels SIDEWAYS. It is the only horizontal
 * motion on the site, and the spine — which has descended for four
 * sections — turns and becomes the rail the day runs along. The line
 * is not illustrating the day here. It is the day.
 */
export default function OneDay() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const rail = q(`.${styles.rail}`)[0] as HTMLElement
    const lead = q(`.${styles.lead}`)
    const moments = q(`.${styles.moment}`) as HTMLElement[]

    /* The travel is measured, not guessed: the rail is as long as its
       own content, whatever the type does at this width. */
    const state = { x: 0 }
    let from = 0
    let to = 0

    const measure = () => {
      const vw = window.innerWidth
      from = vw * 0.96
      to = -(rail.scrollWidth - vw * 0.08)
    }

    /* Only the edges of the frame fade, so nothing pops in or out at
       the boundary. Everything between them is equally legible — this
       section is the calm, practical one, and picking a favourite
       moment would be the wrong idea in it. */
    const apply = () => {
      const vw = window.innerWidth
      gsap.set(rail, { x: state.x })
      moments.forEach((el) => {
        const cx = el.offsetLeft + state.x + el.offsetWidth / 2
        const edge = Math.min(cx / (vw * 0.16), (vw - cx) / (vw * 0.16))
        gsap.set(el, { opacity: gsap.utils.clamp(0, 1, edge) })
      })
    }

    measure()

    if (reduced) {
      state.x = 0
      gsap.set(chars, { yPercent: 0 })
      gsap.set(lead, { opacity: 1 })
      gsap.set(moments, { opacity: 1 })
      gsap.set(rail, { x: 0 })
      return
    }

    state.x = from
    apply()

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
      .to(lead, { opacity: 1, duration: 0.7 }, 0.5)
      .to(lead, { opacity: 0, duration: 0.6 }, 2.6)
      /* Linear: a day does not ease. */
      .to(state, { x: to, duration: 7.2, ease: 'none', onUpdate: apply }, 1.6)

    const onResize = () => {
      measure()
      apply()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      className={styles.root}
      data-surface="light"
      data-spine="studio"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>05 — The studio</span>

        <h2 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>One number to call.</span>
          </span>
        </h2>

        <p className={styles.lead}>
          Six moments out of one customer&apos;s Tuesday. In most businesses
          six different companies own them, and nobody owns what happens in
          between. Here it is one team, one invoice, and the same person on
          the phone.
        </p>

        <div className={styles.rail}>
          {MOMENTS.map((m) => (
            <div className={styles.moment} key={m.at}>
              <span className={styles.what}>{m.what}</span>
              <span className={`${styles.when} label`}>{m.at}</span>
              <span className={styles.tick} aria-hidden="true" />
              <span className={`${styles.who} label`}>1:1</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
