import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import styles from './Mobile.module.css'

/* Six things a customer meets on one visit. One word each — a caption
   explaining a door is worse than no door. */
const HUNG: Array<{ icon: IconName; name: string }> = [
  { icon: 'door', name: 'Door' },
  { icon: 'phone', name: 'Phone' },
  { icon: 'cutlery', name: 'Menu' },
  { icon: 'bell', name: 'Service' },
  { icon: 'receipt', name: 'Receipt' },
  { icon: 'envelope', name: 'Email' },
]

/** How far the row can bow, in px, at full speed. */
const BOW = 78
/** Scroll speed, in px/s, that bows it that far. */
const FULL = 2600
/** How quickly the bow settles back to straight. */
const SETTLE = 0.055
/** Humps across the row. Two, so both ends stay on the line. */
const WAVES = 2

/**
 * 05 · 02 — MOVE ONE
 *
 * Signature: the row bends, the line does not.
 *
 * Six things a customer meets hang off the spine — the customer's own
 * stroke — and the faster the page is scrolled the further the row of
 * them bows away from it, in one wave, before settling back. They are
 * on one thread: you cannot move any of them on their own, and after
 * two seconds of trying you know why that matters.
 *
 * The stroke itself never bends. It is the one thing here that holds
 * its shape, which is the entire proposition of the studio and needs
 * no sentence under it.
 */
export default function Mobile() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const rig = q(`.${styles.rig}`)[0] as HTMLElement
    const drops = q(`.${styles.drop}`) as HTMLElement[]
    const things = q(`.${styles.thing}`) as HTMLElement[]
    const cue = q(`.${styles.cue}`)

    if (reduced) {
      gsap.set(chars, { yPercent: 0 })
      gsap.set(drops, { scaleY: 1 })
      gsap.set([...things, ...cue], { opacity: 1, y: 0 })
      return
    }

    /* Thread lengths are staggered, so each one has to be measured
       before it can be stretched by the wave. */
    const base = drops.map((d) => d.offsetHeight || 1)
    let bow = 0
    let seen = window.scrollY
    let cued = false

    const wave = () => {
      /* Speed, smoothed. A wave that tracked raw scroll delta would
         flicker at every frame boundary. */
      const now = window.scrollY
      const speed = (now - seen) * 60
      seen = now
      const want = gsap.utils.clamp(-1, 1, speed / FULL) * BOW
      bow += (want - bow) * (Math.abs(want) > Math.abs(bow) ? 0.28 : SETTLE)

      if (Math.abs(bow) < 0.05) return
      things.forEach((el, i) => {
        const t = things.length > 1 ? i / (things.length - 1) : 0
        const off = Math.sin(t * Math.PI * WAVES) * bow
        el.style.transform = `translateY(${off.toFixed(2)}px)`
        drops[i].style.transform = `scaleY(${(1 + off / base[i]).toFixed(4)})`
      })

      if (!cued && Math.abs(bow) > BOW * 0.35) {
        cued = true
        gsap.to(cue, { opacity: 0, duration: 0.5 })
      }
    }

    gsap.ticker.add(wave)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    tl.from(chars, { ...HEADING_REVEAL }, 0)

    /* Lowered onto the line one at a time — the thread first, then the
       thing on the end of it. */
    HUNG.forEach((_, i) => {
      const at = 0.9 + i * 0.34
      tl.to(drops[i], { scaleY: 1, duration: 0.45, ease: 'power2.out' }, at)
        .to(things[i], { opacity: 1, duration: 0.5, ease: 'power3.out' }, at + 0.12)
    })

    tl.to(cue, { opacity: 1, duration: 0.6 }, 0.9 + HUNG.length * 0.34)
      /* The whole row travels a little, so the six are passing along
         the line rather than parked on it. */
      .fromTo(rig, { xPercent: 4 }, { xPercent: -4, ease: 'none', duration: 9 }, 0)

    return () => {
      gsap.ticker.remove(wave)
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
            <span>Move one.</span>
          </span>
          <span className="maskline">
            <span>They all move.</span>
          </span>
        </h2>

        {/* Hung from the spine, which crosses this section at 60%. */}
        <div className={styles.rig}>
          {HUNG.map((h) => (
            <div className={styles.hang} key={h.name}>
              <span className={styles.drop} aria-hidden="true" />
              <span className={styles.thing}>
                <PixelIcon name={h.icon} className={styles.glyph} />
                <span className={`${styles.name} label`}>{h.name}</span>
              </span>
            </div>
          ))}
        </div>

        <span className={`${styles.cue} label`}>Scroll harder</span>
      </div>
    </section>
  )
}
