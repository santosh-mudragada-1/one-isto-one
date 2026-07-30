import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import styles from './Mobile.module.css'

/* Six things a customer meets on one visit. One word each — a caption
   explaining a door is worse than no door. */
const CARDS: Array<{ icon: IconName; name: string }> = [
  { icon: 'door', name: 'Door' },
  { icon: 'phone', name: 'Phone' },
  { icon: 'cutlery', name: 'Menu' },
  { icon: 'bell', name: 'Service' },
  { icon: 'receipt', name: 'Receipt' },
  { icon: 'envelope', name: 'Email' },
]

/* ---- the heading, on a line that bends ---------------------------- */

/** The space the headline is drawn in. */
const HW = 1440
const HH = 300
/** The baseline it rests on when nothing is moving. */
const BASE = 176
/** How far the line can bend, in its own units, at full speed. */
const BEND = 52
/** Scroll speed, in px/s, that bends it that far. */
const FULL = 2600
/** How quickly it comes back to straight. */
const SETTLE = 0.06
/** Cubic segments across the width. Eight is already exact enough
 *  that the sine has no visible facets. */
const STEPS = 8

/** One period of a sine as cubics, using the real tangent at each
 *  joint, so the type sits on a true curve and not on a polyline. */
function bent(a: number) {
  const w = (Math.PI * 2) / HW
  const y = (x: number) => BASE + a * Math.sin(w * x)
  const dy = (x: number) => a * w * Math.cos(w * x)
  const h = HW / STEPS
  let d = `M 0 ${y(0).toFixed(2)}`
  for (let i = 0; i < STEPS; i++) {
    const x0 = i * h
    const x1 = x0 + h
    d +=
      ` C ${(x0 + h / 3).toFixed(2)} ${(y(x0) + (h / 3) * dy(x0)).toFixed(2)}` +
      ` ${(x1 - h / 3).toFixed(2)} ${(y(x1) - (h / 3) * dy(x1)).toFixed(2)}` +
      ` ${x1.toFixed(2)} ${y(x1).toFixed(2)}`
  }
  return d
}

/* ---- the cards, travelling --------------------------------------- */

/** Track distance between one card and the next, where 1 is the whole
 *  crossing. Smaller means more of them on screen at once. */
const APART = 0.235
/** How far each card is thrown off the line at full size. */
const LANES = [-72, 48, -30, 86, -58, 28]

/**
 * 05 · 02 — MOVE ONE
 *
 * Two things happen here, and they are driven by two different facts
 * about the same scroll.
 *
 * THE HEADING is set on a line, and the line bends. The faster the
 * page is thrown, the deeper the sine — SPEED, not position — and it
 * settles back to straight the moment you stop. It is the only type on
 * the site that is not on a baseline.
 *
 * THE SIX THINGS cross the screen on the spine itself, right to left,
 * one after another: nothing at the edge, full size as they pass the
 * middle, nothing again as they leave. POSITION, not speed. You never
 * see all six at once, which is the point — a customer does not meet
 * them all at once either, and every one of them is on the same line.
 */
export default function Mobile() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const wave = q(`.${styles.wave}`)[0] as unknown as SVGPathElement
    const cards = q(`.${styles.card}`) as HTMLElement[]
    const cue = q(`.${styles.cue}`)

    /* Where a card is on its crossing, 0 at the right edge and 1 at
       the left. Everything else is a function of that one number. */
    const place = (p: number) => {
      const span = 1 + (cards.length - 1) * APART
      cards.forEach((el, i) => {
        const t = p * span - i * APART
        if (t <= 0 || t >= 1) {
          el.style.visibility = 'hidden'
          return
        }
        el.style.visibility = 'visible'
        /* Nothing at the edges, full size through the middle. */
        const s = Math.pow(Math.sin(Math.PI * t), 0.72)
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          left: `${(1 - t) * 104 - 2}%`,
          y: LANES[i % LANES.length] * s,
          scale: s,
        })
      })
    }

    wave.setAttribute('d', bent(0))

    if (reduced) {
      place(0.5)
      gsap.set(cue, { opacity: 0 })
      return
    }

    place(0)

    gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => place(self.progress),
      },
    })

    /* The bend is speed, so it cannot come off the scrub — it has to
       be measured per frame. */
    let bend = 0
    let seen = window.scrollY
    let cued = false

    const flex = () => {
      const now = window.scrollY
      const speed = (now - seen) * 60
      seen = now
      const want = gsap.utils.clamp(-1, 1, speed / FULL) * BEND
      bend += (want - bend) * (Math.abs(want) > Math.abs(bend) ? 0.3 : SETTLE)
      if (Math.abs(bend) < 0.08) return
      wave.setAttribute('d', bent(bend))
      if (!cued && Math.abs(bend) > BEND * 0.35) {
        cued = true
        gsap.to(cue, { opacity: 0, duration: 0.5 })
      }
    }

    gsap.ticker.add(flex)

    return () => {
      gsap.ticker.remove(flex)
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

        <h2 className={styles.read}>Move one. They all move.</h2>

        <svg
          className={styles.headline}
          viewBox={`0 0 ${HW} ${HH}`}
          aria-hidden="true"
        >
          <path id="oneistoone-headline" className={styles.wave} d="" fill="none" />
          <text>
            <textPath
              href="#oneistoone-headline"
              startOffset="50%"
              textAnchor="middle"
            >
              Move one. They all move.
            </textPath>
          </text>
        </svg>

        <span className={`${styles.cue} label`}>Scroll harder</span>

        {/* On the spine, which crosses this section at 60%. */}
        <div className={styles.track}>
          {CARDS.map((c) => (
            <article className={styles.card} key={c.name}>
              <PixelIcon name={c.icon} className={styles.glyph} hover />
              <span className={`${styles.name} label`}>{c.name}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
