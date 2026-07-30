import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import styles from './Mobile.module.css'

/* Six things a customer meets. One word each — the word is the whole
   label, because a caption explaining a sign is worse than no sign. */
const HUNG: Array<{ icon: IconName; name: string }> = [
  { icon: 'sign', name: 'Sign' },
  { icon: 'browser', name: 'Site' },
  { icon: 'chair', name: 'Room' },
  { icon: 'horn', name: 'Ads' },
  { icon: 'terminal', name: 'Booking' },
  { icon: 'chart', name: 'Email' },
]

/** How far the whole thing can swing, in degrees. */
const SWING = 7

/**
 * 05 · 02 — MOVE ONE
 *
 * Signature: the mobile. The six things hang off the spine — the
 * customer's own line — and the visitor can push them. Push any one of
 * them and all six move, together, in formation, because they are not
 * six things. They are one thing.
 *
 * That is the studio's entire proposition, and nobody has to read it:
 * you cannot move one of these on its own, and after two seconds of
 * trying you know why that matters.
 */
export default function Mobile() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const pin = q(`.${styles.pin}`)[0] as HTMLElement
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

    /* Everything hangs from one pivot ON the line, so there is exactly
       one transform. Six pendulums would let them drift apart, and the
       whole point is that they cannot. */
    const turn = gsap.quickTo(rig, 'rotate', { duration: 0.9, ease: 'elastic.out(1, 0.42)' })
    let nudged = false

    const onMove = (e: PointerEvent) => {
      const box = pin.getBoundingClientRect()
      const off = (e.clientX - (box.left + box.width / 2)) / (box.width / 2)
      turn(gsap.utils.clamp(-1, 1, off) * SWING)
      if (!nudged) {
        nudged = true
        gsap.to(cue, { opacity: 0, duration: 0.5 })
      }
    }
    const onLeave = () => turn(0)

    pin.addEventListener('pointermove', onMove)
    pin.addEventListener('pointerleave', onLeave)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    })

    tl.from(chars, { ...HEADING_REVEAL }, 0)

    /* They are lowered onto the line one at a time — the drop first,
       then the thing on the end of it. */
    HUNG.forEach((_, i) => {
      const at = 0.9 + i * 0.34
      tl.to(drops[i], { scaleY: 1, duration: 0.45, ease: 'power2.out' }, at)
        .to(things[i], { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, at + 0.12)
    })

    tl.to(cue, { opacity: 1, duration: 0.6 }, 0.9 + HUNG.length * 0.34)

    /* A touch screen has no pointer to push with, so the page's own
       movement does the pushing instead. */
    tl.to(rig, { rotate: -SWING * 0.5, duration: 3, ease: 'sine.inOut' }, 3.4)
      .to(rig, { rotate: 0, duration: 3, ease: 'sine.inOut' }, 6.4)

    return () => {
      pin.removeEventListener('pointermove', onMove)
      pin.removeEventListener('pointerleave', onLeave)
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

        <span className={`${styles.cue} label`}>Push it</span>
      </div>
    </section>
  )
}
