import { gsap, ScrollTrigger, prefersReducedMotion } from '../../../lib/gsap'
import { headingChars, HEADING_REVEAL } from '../../../lib/heading'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { ICON_NAMES } from '../../../components/PixelIcon'
import styles from './Apart.module.css'

/** Replace with the real address before launch. */
const EMAIL = 'hello@oneistoone.in'

/** How far the cursor has to travel before another one drops, as a
 *  fraction of the window width — so a wide screen is not a blizzard
 *  and a narrow one is not empty. */
const EVERY = 11
/** Never more than this many in the air at once. */
const MOST = 26

/**
 * 06 · 01 — WHERE IT COMES APART
 *
 * The close. Back to ink, where the page started, so the last screen
 * and the first are the same room.
 *
 * Signature: the line STOPS. After fifteen screens the stroke comes
 * down, runs across the empty space under the sentence, and lands on
 * a 9px square — the colon dot the whole design system is built from.
 * Nothing else on this site ends. The square is not animated to match
 * the stroke: the stroke marks it on arrival, so the two cannot
 * disagree.
 *
 * And underneath it, the only unserious thing on the site: everything
 * a customer touches falls out of the cursor and piles up on the
 * floor. A studio with no work to show has to be worth talking to,
 * and a page that plays back is a page someone stays on.
 */
export default function Apart() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const chars = headingChars(scope)

    const rest = q(`.${styles.rest}`)
    const pin = q(`.${styles.pin}`)[0] as HTMLElement
    const stage = q(`.${styles.stage}`)[0] as HTMLElement
    const seeds = Array.from(
      (q(`.${styles.repo}`)[0] as HTMLElement).children
    ) as HTMLElement[]

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

    /* ---- everything a customer touches, dropped ------------------
       One falls out of the cursor every time it has travelled far
       enough, lands, squashes, bounces once and goes. The bounce is
       harder the further it fell, which is the whole reason it reads
       as weight rather than as a fade. */
    let last: { x: number; y: number } | null = null
    let live = 0

    const drop = (x: number, y: number, dx: number) => {
      if (live >= MOST) return
      const el = seeds[Math.floor(Math.random() * seeds.length)].cloneNode(
        true
      ) as HTMLElement
      el.setAttribute('class', styles.fell)
      stage.appendChild(el)
      live++

      const H = stage.clientHeight
      const size = el.offsetWidth || 40
      const floor = Math.max(0, H - y - size / 2)
      /* Higher up means longer to fall, so it comes back harder. */
      const rebound = Math.min(floor * 0.42, H * 0.22)

      gsap.set(el, {
        left: x - size / 2,
        top: y - size / 2,
        rotate: gsap.utils.random(-24, 24),
        scale: 0,
      })

      gsap
        .timeline({
          onComplete: () => {
            el.remove()
            live--
          },
        })
        .to(el, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)' })
        .to(el, { y: floor, duration: 0.42, ease: 'back.in(1.1)' }, '<')
        .to(
          el,
          {
            x: dx * 0.4,
            rotate: `+=${gsap.utils.random(-70, 70)}`,
            duration: 0.42,
            ease: 'none',
          },
          '<'
        )
        /* It lands. */
        .to(el, { scaleY: 0.78, scaleX: 1.2, duration: 0.07, ease: 'power2.out' })
        .to(el, {
          y: floor - rebound,
          scaleY: 1,
          scaleX: 1,
          duration: 0.42,
          ease: `back.out(${(1.4 + (1 - y / H)).toFixed(2)})`,
        })
        .to(el, { y: floor, duration: 0.34, ease: 'power2.in' })
        .to(el, { opacity: 0, duration: 0.4 }, '-=0.2')
    }

    const onMove = (e: PointerEvent) => {
      const box = stage.getBoundingClientRect()
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      if (!last) {
        last = { x, y }
        return
      }
      const dx = x - last.x
      const gone = Math.hypot(dx, y - last.y)
      /* Scaled to the window, so a wide screen is not a blizzard. */
      if (gone < window.innerWidth / EVERY) return
      last = { x, y }
      drop(x, y, dx)
    }
    const onLeave = () => (last = null)

    pin.addEventListener('pointermove', onMove)
    pin.addEventListener('pointerleave', onLeave)

    return () => {
      pin.removeEventListener('pointermove', onMove)
      pin.removeEventListener('pointerleave', onLeave)
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
        {/* Cloned from, never shown. */}
        <div className={styles.repo} aria-hidden="true">
          {ICON_NAMES.map((n) => (
            <span className={styles.seed} key={n}>
              <PixelIcon name={n} />
            </span>
          ))}
        </div>
        <div className={styles.stage} aria-hidden="true" />

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
