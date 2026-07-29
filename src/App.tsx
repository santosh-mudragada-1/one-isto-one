import { useCallback, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from './lib/gsap'
import VersionFab from './components/VersionFab'
import { CONCEPTS } from './heroes'
import styles from './App.module.css'

export default function App() {
  const [index, setIndex] = useState(0)
  /** Bumping this remounts the hero, which replays it from frame one. */
  const [take, setTake] = useState(0)

  const curtain = useRef<HTMLDivElement | null>(null)
  const label = useRef<HTMLDivElement | null>(null)
  const busy = useRef(false)

  /** Cover, swap, uncover. */
  const wipe = useCallback((apply: () => void, incoming: number) => {
    const el = curtain.current
    if (!el || prefersReducedMotion()) {
      apply()
      return
    }
    if (busy.current) return
    busy.current = true

    const c = CONCEPTS[incoming]
    if (label.current) {
      label.current.innerHTML = `<span class="${styles.curtainNum}">${c.num}</span><span class="label">${c.name}</span>`
    }

    gsap
      .timeline({ onComplete: () => (busy.current = false) })
      .set(el, { display: 'grid', transformOrigin: 'bottom' })
      .to(el, { scaleY: 1, duration: 0.42, ease: 'power4.inOut' })
      .add(apply)
      .set(el, { transformOrigin: 'top' })
      .to(el, { scaleY: 0, duration: 0.55, ease: 'power4.inOut' }, '+=0.12')
      .set(el, { display: 'none' })
  }, [])

  const select = useCallback(
    (i: number) => {
      if (i === index) {
        wipe(() => setTake((t) => t + 1), i)
        return
      }
      wipe(() => setIndex(i), i)
    },
    [index, wipe]
  )

  const replay = useCallback(() => {
    setTake((t) => t + 1)
  }, [])

  const { Component } = CONCEPTS[index]

  return (
    <>
      <main className={styles.stage}>
        <Component key={`${index}-${take}`} />
      </main>

      <div className={styles.curtain} ref={curtain} aria-hidden="true">
        <div className={styles.curtainInner} ref={label} />
      </div>

      <VersionFab index={index} onSelect={select} onReplay={replay} />
    </>
  )
}
