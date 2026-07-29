import { useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { sfx } from '../../lib/sound'
import { useGsap } from '../../lib/useGsap'
import Mark from '../../components/Mark'
import TopBar from '../../components/TopBar'
import styles from './Ratio.module.css'

/* Not "design deliverables" — the things a business actually owns. This
   list does more selling than the headline does, because a restaurant
   owner recognises every single item on it. */
const PIECES = [
  { x: 6, y: 18, t: 'menu' },
  { x: 27, y: 17, t: 'signage' },
  { x: 15, y: 26, t: 'website' },
  { x: 34, y: 25, t: 'business cards' },
  { x: 4, y: 34, t: 'packaging' },
  { x: 23, y: 35, t: 'uniforms' },
  { x: 40, y: 34, t: 'ads' },
  { x: 9, y: 43, t: 'receipt' },
  { x: 28, y: 44, t: 'lighting' },
  { x: 42, y: 43, t: 'scent' },
  { x: 5, y: 52, t: 'playlist' },
  { x: 21, y: 53, t: 'tone of voice' },
  { x: 37, y: 52, t: 'app' },
  { x: 13, y: 60, t: 'interior' },
]

/* Four inconsistent greys — the fragments were made by four different
   suppliers who never spoke to each other. */
const SHADES = ['#4a4a48', '#61615e', '#8f8f8a', '#b9b9b3']

/** Divider travel. Kept tight so no word on either side is ever cut. */
const RANGE = { min: 40, max: 60 }

/**
 * 05 — THE LIVING RATIO
 *
 * Signature interaction: the screen is split by the colon itself. The
 * divider follows the cursor and always eases back to exact centre —
 * to 1:1. The problem and the solution are on screen at the same time,
 * with no jargon in between.
 */
export default function Ratio() {
  const [logoTone, setLogoTone] = useState<'light' | 'dark'>('dark')
  const readout = useRef<HTMLSpanElement | null>(null)

  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()
    const cells = q(`.${styles.cell}`) as HTMLElement[]

    /* --- the split -------------------------------------------- */
    const state = { v: 8 }
    const apply = () => {
      scope.style.setProperty('--split', `${state.v}%`)
      if (readout.current) {
        const l = Math.round(state.v)
        readout.current.textContent = `${l} : ${100 - l}`
      }
      /* The wordmark sits at ~4% — if the split ever travels left of
         it, the surface underneath becomes paper and the mark has to
         invert. Same rule the whole site will use. */
      setLogoTone(state.v < 11 ? 'light' : 'dark')
    }

    if (reduced) {
      state.v = 50
      apply()
      return
    }

    apply()

    const intro = gsap.to(state, {
      v: 50,
      duration: 1.75,
      ease: 'power3.inOut',
      onUpdate: apply,
      onComplete: () => sfx.lock(),
    })

    /* Fragments arrive scattered… */
    gsap.from(cells, {
      opacity: 0,
      x: -18,
      duration: 0.9,
      stagger: { each: 0.055, from: 'start' },
      ease: 'power3.out',
    })

    /* …and never quite settle, which is the entire argument for the
       right-hand side. */
    cells.forEach((cell, i) => {
      gsap.to(cell, {
        x: `+=${(i % 3) - 1 === 0 ? 5 : ((i % 3) - 1) * 6}`,
        y: `+=${((i % 4) - 1.5) * 4.5}`,
        duration: 3.4 + (i % 5) * 0.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.2 + i * 0.09,
      })
    })

    /* The ordered side assembles: mark, rule, then the same words
       falling into their grid positions in order. */
    const order = gsap.timeline({ delay: 0.8 })
    order
      .from(q(`.${styles.mark}`), { opacity: 0, y: 16, duration: 0.9 })
      .from(q(`.${styles.hair}`), { scaleX: 0, duration: 1.1, ease: 'power4.out' }, 0.15)
      .from(
        q(`.${styles.item}`),
        { opacity: 0, y: 10, duration: 0.6, stagger: 0.035 },
        0.35
      )

    gsap.from(q('.maskline > span'), {
      yPercent: 115,
      duration: 1,
      stagger: 0.09,
      delay: 0.5,
      ease: 'power4.out',
    })
    gsap.from(q(`.${styles.colon}`), {
      scaleY: 0,
      opacity: 0,
      duration: 0.8,
      delay: 1.5,
      ease: 'power4.out',
    })

    /* --- push the ratio around -------------------------------- */
    const to = gsap.quickTo(state, 'v', {
      duration: 0.7,
      ease: 'power3',
      onUpdate: apply,
    })

    let live = false
    intro.then(() => (live = true))

    const onMove = (e: PointerEvent) => {
      if (!live) return
      /* Cursor travel is heavily geared down — the divider explores a
         narrow band around centre rather than tracking the pointer. */
      const n = gsap.utils.clamp(-1, 1, (e.clientX / window.innerWidth - 0.5) * 2)
      to(gsap.utils.mapRange(-1, 1, RANGE.min, RANGE.max, n))
    }
    const onLeave = () => {
      if (live) to(50)
    }

    scope.addEventListener('pointermove', onMove)
    scope.addEventListener('pointerleave', onLeave)

    return () => {
      scope.removeEventListener('pointermove', onMove)
      scope.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className={styles.root} ref={root}>
      {/* ---------- built in pieces ---------- */}
      <div className={`${styles.side} ${styles.left}`}>
        {PIECES.map((p, i) => (
          <span
            key={p.t}
            className={`${styles.cell} chamfer-box label`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              color: SHADES[i % SHADES.length],
            }}
          >
            <span>{p.t}</span>
          </span>
        ))}

        <h1 className={`display display--sm ${styles.head}`}>
          <span className="maskline">
            <span>Built in</span>
          </span>
          <span className="maskline">
            <span>pieces.</span>
          </span>
        </h1>
      </div>

      {/* ---------- built whole ---------- */}
      <div className={`${styles.side} ${styles.right}`}>
        <div className={styles.wholeCol}>
          <Mark className={styles.mark} />
          <div className={styles.hair} />
          <ul className={`${styles.list} label`}>
            {PIECES.map((p) => (
              <li key={p.t} className={styles.item}>
                {p.t}
              </li>
            ))}
          </ul>
        </div>

        <h2 className={`display display--sm ${styles.headRight}`}>
          <span className="maskline">
            <span>Built</span>
          </span>
          <span className="maskline">
            <span>whole.</span>
          </span>
        </h2>
      </div>

      {/* ---------- the colon ---------- */}
      <div className={styles.divider} aria-hidden="true">
        <div className={styles.colon}>
          <span className={styles.sq}>
            <i className={`${styles.half} ${styles.halfL}`} />
            <i className={`${styles.half} ${styles.halfR}`} />
          </span>
          <span className={styles.sq}>
            <i className={`${styles.half} ${styles.halfL}`} />
            <i className={`${styles.half} ${styles.halfR}`} />
          </span>
        </div>
      </div>

      {/* Links sit on paper, the wordmark on ink — so the two halves of
          the chrome are toned independently. */}
      <TopBar tone="light" logoTone={logoTone} />

      <span className={`${styles.footLeft} label`}>India — 2026</span>
      <span className={styles.ratioReadout} ref={readout} aria-hidden="true">
        8 : 92
      </span>
    </div>
  )
}
