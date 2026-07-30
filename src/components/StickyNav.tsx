import { useEffect, useState } from 'react'
import TopBar from './TopBar'
import type { Tone } from './NavLogo'
import styles from './StickyNav.module.css'

/** The row the nav actually occupies — the surface under THIS is what
 *  the wordmark and links have to be legible against. */
const NAV_BAND = 34

/**
 * The nav, fixed for the whole page rather than living inside the hero
 * and scrolling away with it.
 *
 * It re-tones itself from whichever section is under it, so crossing
 * from the ink sections into Section 03's light ground inverts the
 * wordmark and the links instead of leaving black type on black.
 */
export default function StickyNav() {
  const [tone, setTone] = useState<Tone>('dark')

  useEffect(() => {
    let raf = 0

    const read = () => {
      raf = 0
      let found: Tone = 'dark'
      document.querySelectorAll<HTMLElement>('[data-surface]').forEach((z) => {
        const r = z.getBoundingClientRect()
        if (r.top <= NAV_BAND && r.bottom > NAV_BAND) {
          found = z.dataset.surface === 'light' ? 'light' : 'dark'
        }
      })
      setTone((t) => (t === found ? t : found))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className={styles.fixed}>
      <TopBar tone={tone} />
    </div>
  )
}
