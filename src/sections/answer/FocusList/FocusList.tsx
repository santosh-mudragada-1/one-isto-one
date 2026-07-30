import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import Spine from '../../../components/Spine'
import styles from './FocusList.module.css'

/* The customer's line, continuing. Long tail so it covers the join into
   the next section, whose own stroke has barely started by then. */
const SPINE = 'M 1290 -340 V 2000'

/* Five parts of one experience. Each name is two words, so the thing it
   makes can open a gap in the middle of it. */
const FIVE: Array<{ a: string; b: string; icon: IconName; sub: string }> = [
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
/** Where a name is at full size — the middle of the frame. */
const CENTRE = 0.5
/** Ramps in just above the fold, and out well before the heading. */
const ENTER_AT = 1.04
const ENTER_OVER = 0.14
/* Higher now that the statement sits lower — a name must be gone
   before it can reach it. */
const EXIT_AT = 0.26
const EXIT_OVER = 0.08

const toneAt = gsap.utils.interpolate('#8f8f8a', '#0e0e0e')

/**
 * 03 · 02 — THE FOCUS LIST
 *
 * Answers "so what does 1:1 actually do?" by making it impossible to
 * take the five in at once.
 *
 * All five ride one track that is translated as a whole, so they
 * genuinely travel up through the frame rather than fading in where they
 * will end up. Scale and weight are computed from each name's live
 * distance from the centre of the viewport, so a name grows on the way
 * in and shrinks on the way out — the state is a function of position,
 * never a step between two states.
 *
 * It is a list and not a menu: you cannot compare five things you can
 * only read one of, so it stays a sequence rather than a price sheet.
 */
export default function FocusList() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const pin = q(`.${styles.pin}`)[0] as HTMLElement
    const track = q(`.${styles.track}`)[0] as HTMLElement
    const items = q(`.${styles.item}`) as HTMLElement[]
    const slots = q(`.${styles.slot}`) as HTMLElement[]
    const subs = q(`.${styles.sub}`) as HTMLElement[]
    const head = q(`.${styles.head}`)
    const blurbs = q(`.${styles.blurbs}`)

    /* Layout metrics, taken once. Item centres are measured unscaled —
       offsetTop/offsetHeight ignore transforms, so scaling a name never
       feeds back into where the track thinks it is. */
    let trackTop = 0
    let centres: number[] = []
    let spacing = 200
    let slotW = 40
    let from = 0
    let to = 0

    const measure = () => {
      trackTop = track.offsetTop
      centres = items.map((el) => el.offsetTop + el.offsetHeight / 2)
      spacing = centres.length > 1 ? centres[1] - centres[0] : 200
      slotW = (slots[0]?.firstElementChild as HTMLElement)?.offsetWidth ?? 40
      const vh = window.innerHeight
      /* First name starts below the fold; last one ends above it. */
      from = vh * 1.12 - (trackTop + centres[0])
      to = -vh * 0.1 - (trackTop + centres[centres.length - 1])
    }

    const state = { ty: 0 }

    const apply = () => {
      const vh = window.innerHeight
      const top = pin.getBoundingClientRect().top
      gsap.set(track, { y: state.ty })

      items.forEach((el, i) => {
        const cy = top + trackTop + state.ty + centres[i]
        /* Full size at the centre, base size one neighbour away. */
        const near = Math.max(0, 1 - Math.abs(cy - vh * CENTRE) / spacing)
        /* Never allowed to reach the heading, which stays put. */
        const enter = gsap.utils.clamp(
          0,
          1,
          (vh * ENTER_AT - cy) / (vh * ENTER_OVER)
        )
        const exit = gsap.utils.clamp(0, 1, (cy - vh * EXIT_AT) / (vh * EXIT_OVER))
        const vis = Math.min(enter, exit)

        gsap.set(el, {
          scale: 1 + near * FOCUS_SCALE,
          color: toneAt(near),
          opacity: vis,
        })
        gsap.set(slots[i], { width: near * (slotW + 16) })
        gsap.set(subs[i], { opacity: Math.max(0, near * 1.6 - 0.6) * vis })
      })
    }

    measure()

    if (reduced) {
      state.ty = window.innerHeight * CENTRE - (trackTop + centres[2])
      gsap.set(blurbs, { opacity: 1 })
      gsap.set(chars, { yPercent: 0 })
      apply()
      return
    }

    state.ty = from
    apply()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    /* The statement arrives and stays. It is the last thing on screen
       too — the section ends on it rather than handing over to a
       separate closing line. */
    tl.from(
      chars,
      { ...HEADING_REVEAL },
      0
    )
      .to(blurbs, { opacity: 1, duration: 0.8 }, 0.8)
      .to(blurbs, { opacity: 0, duration: 0.6 }, 2.4)

      /* The whole track travels. Linear on purpose: easing here would
         make one of the five feel more important than the others. */
      .to(state, { ty: to, duration: 6.9, ease: 'none', onUpdate: apply }, 2.4)

    void head

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
    <section className={styles.root} data-surface="light" ref={root}>
      <div className={styles.pin}>
        <span className={`${styles.eyebrow} label`}>03 — What we do</span>

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

        <div className={styles.track}>
          {FIVE.map((f) => (
            <div className={styles.item} key={f.a}>
              <span>{f.a}</span>
              <span className={styles.slot} aria-hidden="true">
                <PixelIcon name={f.icon} className={styles.slotInner} />
              </span>
              <span>{f.b}</span>
              <span className={`${styles.sub} label`}>{f.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last, so it paints over this section's own content. */}
      <Spine d={SPINE} />
    </section>
  )
}
