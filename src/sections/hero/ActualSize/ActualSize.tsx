import { useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import Chrome from '../../../components/Chrome'
import styles from './ActualSize.module.css'

/**
 * 01 — ACTUAL SIZE
 *
 * Signature interaction: the page measures itself. The dimension
 * figures are real — resize the window and they re-count to the true
 * value. Nothing here is decoration pretending to be an instrument.
 */
export default function ActualSize() {
  const wRef = useRef<HTMLSpanElement | null>(null)
  const hRef = useRef<HTMLSpanElement | null>(null)

  const root = useGsap<HTMLDivElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    /* --- live dimension figures ------------------------------- */
    const dims = { w: 0, h: 0 }
    const paint = () => {
      if (wRef.current) wRef.current.textContent = `${Math.round(dims.w)}`
      if (hRef.current) hRef.current.textContent = `${Math.round(dims.h)}`
    }

    const measure = (animated: boolean) => {
      const target = { w: window.innerWidth, h: window.innerHeight }
      if (!animated) {
        dims.w = target.w
        dims.h = target.h
        paint()
        return
      }
      gsap.to(dims, {
        w: target.w,
        h: target.h,
        duration: 0.5,
        ease: 'power2.out',
        snap: { w: 1, h: 1 },
        onUpdate: paint,
      })
    }

    let resizeId = 0
    const onResize = () => {
      window.clearTimeout(resizeId)
      resizeId = window.setTimeout(() => measure(true), 90)
    }
    window.addEventListener('resize', onResize)

    /* --- crosshair -------------------------------------------- */
    const cross = q(`.${styles.cross}`)[0] as HTMLElement | undefined
    const crossX = q(`.${styles.crossX}`)[0] as HTMLElement | undefined
    const crossY = q(`.${styles.crossY}`)[0] as HTMLElement | undefined
    const coords = q(`.${styles.coords}`)[0] as HTMLElement | undefined

    let onMove: ((e: PointerEvent) => void) | null = null
    if (cross && crossX && crossY && coords && !reduced) {
      const toY = gsap.quickTo(crossX, 'y', { duration: 0.28, ease: 'power3' })
      const toX = gsap.quickTo(crossY, 'x', { duration: 0.28, ease: 'power3' })
      const cX = gsap.quickTo(coords, 'x', { duration: 0.28, ease: 'power3' })
      const cY = gsap.quickTo(coords, 'y', { duration: 0.28, ease: 'power3' })

      onMove = (e: PointerEvent) => {
        toY(e.clientY)
        toX(e.clientX)
        cX(e.clientX + 14)
        cY(e.clientY + 14)
        coords.textContent = `X ${Math.round(e.clientX)}  Y ${Math.round(e.clientY)}`
        gsap.to(cross, { opacity: 1, duration: 0.3, overwrite: 'auto' })
      }
      scope.addEventListener('pointermove', onMove)
      scope.addEventListener('pointerleave', () =>
        gsap.to(cross, { opacity: 0, duration: 0.3, overwrite: 'auto' })
      )
    }

    /* --- entrance --------------------------------------------- */
    if (reduced) {
      measure(false)
      gsap.set(q(`.${styles.rule}, .${styles.cap}, .${styles.eyebrowRule}`), {
        scaleX: 1,
        scaleY: 1,
      })
      gsap.set(q(`.${styles.readout}, .${styles.sub}, .${styles.eyebrow} span`), {
        opacity: 1,
      })
      gsap.set(q('.maskline > span'), { yPercent: 0 })
      return () => window.removeEventListener('resize', onResize)
    }

    dims.w = 0
    dims.h = 0
    paint()

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from(q(`.${styles.cap}`), {
      scaleY: 0,
      scaleX: 0,
      duration: 0.45,
      stagger: 0.06,
    })
      .from(
        q(`.${styles.dimH} .${styles.rule}`),
        { scaleX: 0, duration: 0.95, ease: 'power4.inOut' },
        0.1
      )
      .from(
        q(`.${styles.dimV} .${styles.rule}`),
        { scaleY: 0, duration: 0.95, ease: 'power4.inOut' },
        0.18
      )
      .from(q(`.${styles.readout}`), { opacity: 0, duration: 0.5 }, 0.5)
      .add(() => measure(true), 0.42)
      .from(q(`.${styles.eyebrowRule}`), { scaleX: 0, duration: 0.7 }, 0.35)
      .from(q(`.${styles.eyebrow} span:last-child`), { opacity: 0, duration: 0.6 }, 0.5)
      .from(
        q('.maskline > span'),
        { yPercent: 110, duration: 1.05, stagger: 0.085, ease: 'power4.out' },
        0.45
      )
      .from(q(`.${styles.sub}`), { opacity: 0, y: 14, duration: 0.8 }, 1.05)

    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeId)
      if (onMove) scope.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div className={styles.root} ref={root}>
      <Chrome tone="dark" />

      {/* horizontal dimension */}
      <div className={`${styles.dim} ${styles.dimH}`}>
        <span className={styles.cap} />
        <span className={styles.rule} />
        <span className={styles.cap} />
        <span className={styles.readout}>
          <span ref={wRef}>0</span>
        </span>
      </div>

      {/* vertical dimension */}
      <div className={`${styles.dim} ${styles.dimV}`}>
        <span className={styles.cap} />
        <span className={styles.rule} />
        <span className={styles.cap} />
        <span className={styles.readout}>
          <span ref={hRef}>0</span>
        </span>
      </div>

      <div className={styles.content}>
        <div className={`${styles.eyebrow} label`}>
          <span className={styles.eyebrowRule} />
          <span>Scale 1:1 — full size</span>
        </div>

        <h1 className="display">
          <span className="maskline">
            <span>No part of</span>
          </span>
          <span className="maskline">
            <span>your business</span>
          </span>
          <span className="maskline">
            <span>gets scaled down.</span>
          </span>
        </h1>

        <p className={styles.sub}>
          Nothing sketched. Nothing approximated. Nothing handed to a stranger
          halfway through.
        </p>
      </div>

      <div className={styles.cross} aria-hidden="true">
        <span className={styles.crossX} />
        <span className={styles.crossY} />
        <span className={styles.coords}>X 0 Y 0</span>
      </div>
    </div>
  )
}
