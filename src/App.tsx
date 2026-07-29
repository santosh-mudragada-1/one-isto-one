import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/gsap'
import VersionFab from './components/VersionFab'
import { SECTIONS } from './sections'
import styles from './App.module.css'

export default function App() {
  const [section, setSection] = useState(0)
  const [version, setVersion] = useState(0)
  /** Bumping this remounts the version, replaying it from frame one. */
  const [take, setTake] = useState(0)

  const curtain = useRef<HTMLDivElement | null>(null)
  const label = useRef<HTMLDivElement | null>(null)
  const busy = useRef(false)

  const current = SECTIONS[section]
  const currentVersion = current.versions[version]

  /* A scroll-driven version starts at the top with its triggers freshly
     measured — otherwise it inherits the previous version's scroll
     position and starts halfway through itself. */
  useEffect(() => {
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [section, version, take])

  /** Cover, swap, uncover. */
  const wipe = useCallback((apply: () => void, s: number, v: number) => {
    const el = curtain.current
    if (!el || prefersReducedMotion()) {
      apply()
      return
    }
    if (busy.current) return
    busy.current = true

    const target = SECTIONS[s].versions[v]
    if (label.current) {
      label.current.innerHTML =
        `<span class="${styles.curtainNum}">${SECTIONS[s].num} — ${target.num}</span>` +
        `<span class="label">${target.name}</span>`
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
    (s: number, v: number) => {
      const clampedV = Math.min(v, SECTIONS[s].versions.length - 1)
      if (s === section && clampedV === version) {
        wipe(() => setTake((t) => t + 1), s, clampedV)
        return
      }
      wipe(() => {
        setSection(s)
        setVersion(clampedV)
      }, s, clampedV)
    },
    [section, version, wipe]
  )

  const replay = useCallback(() => setTake((t) => t + 1), [])

  const { Component } = currentVersion

  return (
    <>
      <main className={styles.stage}>
        <Component key={`${section}-${version}-${take}`} />
      </main>

      {currentVersion.scrolls && (
        <span className={`${styles.scrollHint} label`} aria-hidden="true">
          Scroll
          <span className={styles.scrollHintTick} />
        </span>
      )}

      <div className={styles.curtain} ref={curtain} aria-hidden="true">
        <div className={styles.curtainInner} ref={label} />
      </div>

      <VersionFab
        section={section}
        version={version}
        onSelect={select}
        onReplay={replay}
      />
    </>
  )
}
