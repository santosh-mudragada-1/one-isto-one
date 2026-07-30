import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import Spine from '../../../components/Spine'
import styles from './FocusList.module.css'

/* The customer's line, continuing. Generous lead-in and tail so it
   overlaps the neighbouring sections' stretches and can never appear to
   break at a join. */
const SPINE = 'M 1290 -10 V 1160'

/* Five parts of one experience. Each name is two words, so the thing it
   makes can open a gap in the middle of it. */
const FIVE: Array<{
  a: string
  b: string
  icon: IconName
  sub: string
}> = [
  {
    a: 'Brand',
    b: 'Experience',
    icon: 'sign',
    sub: 'What it means, before anyone has to ask.',
  },
  {
    a: 'Product',
    b: 'Experience',
    icon: 'chair',
    sub: 'The thing itself, and how it feels to hold.',
  },
  {
    a: 'Digital',
    b: 'Experience',
    icon: 'browser',
    sub: 'Every screen, in the same voice.',
  },
  {
    a: 'Spatial',
    b: 'Experience',
    icon: 'terminal',
    sub: 'The room, agreeing with the sign outside.',
  },
  {
    a: 'Growth',
    b: 'Systems',
    icon: 'chart',
    sub: 'What happens after opening week.',
  },
]

const FOCUS_SCALE = 0.62
const toneAt = gsap.utils.interpolate('#8f8f8a', '#0e0e0e')

/**
 * 03 · 02 — THE FOCUS LIST
 *
 * Answers "so what does 1:1 actually do?" by making it impossible to
 * take the five in at once. Focus travels down the list continuously:
 * whatever is in focus scales up, goes to full ink and opens a gap in
 * its own name for the object it makes; everything else holds back.
 *
 * It is a list and not a menu. You cannot compare five items you can
 * only read one of, so it reads as a sequence you move through — which
 * is the difference between an ecosystem and a price sheet.
 */
export default function FocusList() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const arrive = q(`.${styles.arrive}`)
    const head = q(`.${styles.head}`)
    const blurbs = q(`.${styles.blurbs}`)
    const list = q(`.${styles.list}`)
    const items = q(`.${styles.item}`) as HTMLElement[]
    const slots = q(`.${styles.slot}`) as HTMLElement[]
    const subs = q(`.${styles.sub}`) as HTMLElement[]
    const close = q(`.${styles.close}`)

    /* One continuous focus value drives everything, so an item scales up
       AND back down as it passes rather than snapping between states. */
    const state = { f: -0.85 }
    const slotWidth = () =>
      (slots[0]?.firstElementChild as HTMLElement)?.offsetWidth ?? 40

    const apply = () => {
      const w = slotWidth()
      items.forEach((el, i) => {
        const near = Math.max(0, 1 - Math.abs(i - state.f))
        gsap.set(el, {
          scale: 1 + near * FOCUS_SCALE,
          color: toneAt(near),
        })
        gsap.set(slots[i], { width: near * (w + 16) })
        /* The explanation only earns the frame near full focus. */
        gsap.set(subs[i], { opacity: Math.max(0, near * 1.6 - 0.6) })
      })
    }

    if (reduced) {
      gsap.set(arrive, { scaleX: 1 })
      gsap.set([blurbs, list], { opacity: 1 })
      gsap.set(q('.maskline > span'), { yPercent: 0 })
      state.f = 0
      apply()
      return
    }

    apply()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    /* The statement, then the two lines, then the reading begins. */
    tl.from(
      q('.maskline > span'),
      { yPercent: 115, duration: 0.9, stagger: 0.1, ease: 'power4.out' },
      0
    )
      .to(arrive, { scaleX: 1, duration: 1.35, ease: 'power2.inOut' }, 0.45)
      .to(blurbs, { opacity: 1, duration: 0.8 }, 1.1)

      /* The opening statement gives the centre to the list. */
      .to([head, blurbs], { opacity: 0, duration: 0.7 }, 2.6)
      .to(list, { opacity: 1, duration: 0.7 }, 2.9)

      /* Focus travels the whole list, one name at a time. Linear on
         purpose: any easing here would make one of the five feel more
         important than the others. */
      .to(
        state,
        {
          f: FIVE.length - 1 + 0.85,
          duration: 5.4,
          ease: 'none',
          onUpdate: apply,
        },
        3.2
      )

      .to(list, { opacity: 0, duration: 0.6 }, 8.9)
      .to(close, { opacity: 1, duration: 0.7 }, 9.3)

    const onResize = () => apply()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section className={styles.root} data-surface="light" ref={root}>
      <Spine d={SPINE} />

      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>03 — What we do</span>

        <span className={styles.arrive} aria-hidden="true" />

        <h2 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>We don&apos;t do five things.</span>
          </span>
        </h2>

        <div className={styles.blurbs}>
          <p className={styles.blurb}>
            Nobody owned the space between the six. That space is where a
            business is actually experienced.
          </p>
          <p className={styles.blurb}>
            So we hold all of it — not as five services, but as five parts of
            one experience your customer never sees the seams in.
          </p>
        </div>

        <ul className={styles.list}>
          {FIVE.map((f) => (
            <li className={styles.item} key={f.a}>
              <span>{f.a}</span>
              <span className={styles.slot} aria-hidden="true">
                <PixelIcon name={f.icon} className={styles.slotInner} />
              </span>
              <span>{f.b}</span>
            </li>
          ))}
        </ul>

        <div className={styles.subs}>
          {FIVE.map((f) => (
            <span className={`${styles.sub} label`} key={f.a}>
              {f.sub}
            </span>
          ))}
        </div>

        <h3 className={`display display--sm ${styles.close}`}>
          Holding it is the easy half.
        </h3>
      </div>
    </section>
  )
}
