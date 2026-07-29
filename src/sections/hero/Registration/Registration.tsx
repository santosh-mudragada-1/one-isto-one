import { gsap, prefersReducedMotion } from '../../../lib/gsap'
import { sfx } from '../../../lib/sound'
import { useGsap } from '../../../lib/useGsap'
import Chrome from '../../../components/Chrome'
import styles from './Registration.module.css'

const LINES = ['What you mean.', 'What they feel.']

/**
 * 03 — REGISTRATION
 *
 * Two impressions of the same forme, slightly out of register. They
 * converge and lock — and afterwards the cursor can pull them apart
 * again, so the visitor feels the cost of misalignment rather than
 * being told about it.
 *
 * Blurry-then-sharp needs no design vocabulary to understand, which is
 * why this concept survives contact with a non-designer.
 */
export default function Registration() {
  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const ghost = q(`.${styles.ghost}`)[0] as HTMLElement
    const solid = q(`.${styles.solid}`)[0] as HTMLElement
    const marks = q(`.${styles.mark}`) as HTMLElement[]
    const sub = q(`.${styles.sub}`)[0] as HTMLElement
    const hint = q(`.${styles.hint}`)[0] as HTMLElement

    if (reduced) {
      gsap.set([ghost, solid], { x: 0, y: 0, '--blur': '0px' })
      gsap.set([sub, ...marks], { opacity: 1 })
      return
    }

    /* --- the lock --------------------------------------------- */
    const OFFSET = { x: 26, y: 16 }

    const tl = gsap.timeline()

    tl.set(ghost, { x: OFFSET.x, y: -OFFSET.y, '--blur': '9px', opacity: 0 })
      .set(solid, { x: -OFFSET.x, y: OFFSET.y, '--blur': '9px', opacity: 0 })
      .set(marks, { opacity: 0, scale: 0.7 })

      // both plates arrive, still off register
      .to([ghost, solid], { opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to(
        marks,
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' },
        0.15
      )
      .add(() => sfx.slide(), 0.15)

      // …and come into register. Decisive landing, no overshoot —
      // a press closing, not a spring settling.
      .to(
        [ghost, solid],
        {
          x: 0,
          y: 0,
          '--blur': '0px',
          duration: 1.15,
          ease: 'power4.out',
        },
        0.75
      )

      // the moment of resolution
      .add(() => sfx.lock(), 1.72)
      .to(solid, { color: '#ffffff', duration: 0.12 }, 1.72)
      .to(solid, { color: '#edede9', duration: 0.9, ease: 'power2.out' }, 1.84)
      .to(
        marks,
        { scale: 1.14, duration: 0.14, ease: 'power2.out' },
        1.72
      )
      .to(marks, { scale: 1, duration: 0.5, ease: 'power3.out' }, 1.86)
      .to(sub, { opacity: 1, duration: 0.9, ease: 'power3.out' }, 2.0)
      .from(q(`.${styles.subRule}`), { scaleX: 0, duration: 0.9, ease: 'power4.out' }, 2.0)
      .to(hint, { opacity: 1, duration: 0.8 }, 2.7)

    /* --- pull it back out of register -------------------------
       Enabled only once the lock has landed, so the intro is never
       fought. Range is deliberately tiny: this should read as
       tension, never as a toy. */
    const MAX = 7
    let live = false
    tl.add(() => (live = true), 1.9)

    const gx = gsap.quickTo(ghost, 'x', { duration: 0.55, ease: 'power3' })
    const gy = gsap.quickTo(ghost, 'y', { duration: 0.55, ease: 'power3' })
    const sx = gsap.quickTo(solid, 'x', { duration: 0.55, ease: 'power3' })
    const sy = gsap.quickTo(solid, 'y', { duration: 0.55, ease: 'power3' })

    let hinted = false
    const onMove = (e: PointerEvent) => {
      if (!live) return
      if (!hinted) {
        hinted = true
        gsap.to(hint, { opacity: 0, duration: 0.5 })
      }
      const nx = gsap.utils.clamp(
        -1,
        1,
        (e.clientX / window.innerWidth - 0.5) * 2
      )
      const ny = gsap.utils.clamp(
        -1,
        1,
        (e.clientY / window.innerHeight - 0.5) * 2
      )
      gx(nx * MAX)
      gy(ny * MAX)
      sx(-nx * MAX)
      sy(-ny * MAX)
    }

    const onLeave = () => {
      if (!live) return
      gx(0)
      gy(0)
      sx(0)
      sy(0)
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
      <Chrome tone="dark" />

      <div className={styles.centre}>
        <div className={styles.stack}>
          {/* second impression */}
          <h1
            className={`display ${styles.layer} ${styles.ghost}`}
            aria-hidden="true"
          >
            {LINES.map((l) => (
              <span key={l} style={{ display: 'block' }}>
                {l}
              </span>
            ))}
          </h1>

          {/* first impression */}
          <h1 className={`display ${styles.layer} ${styles.solid}`}>
            {LINES.map((l) => (
              <span key={l} style={{ display: 'block' }}>
                {l}
              </span>
            ))}
          </h1>

          {(['tl', 'tr', 'br', 'bl'] as const).map((corner) => (
            <span
              key={corner}
              className={`${styles.mark} ${styles[corner]}`}
              aria-hidden="true"
            >
              <span className={styles.h} />
              <span className={styles.v} />
            </span>
          ))}

          <p className={`${styles.sub} label`}>
            <span className={styles.subRule} />
            Same thing. That&apos;s 1:1.
          </p>
        </div>
      </div>

      <span className={`${styles.hint} label`}>Move your cursor</span>
    </div>
  )
}
