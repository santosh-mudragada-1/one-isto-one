import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/gsap'
import Spine from './components/Spine'
import StickyNav from './components/StickyNav'
import VersionFab from './components/VersionFab'
import Assembled from './sections/Assembled'
import { SECTIONS, defaultPosition } from './sections'
import styles from './App.module.css'

const START = defaultPosition()

export default function App() {
  /** The assembled page is the deliverable; the single-version view is
   *  a review tool for comparing directions. */
  const [assembled, setAssembled] = useState(true)
  const [section, setSection] = useState(START.section)
  const [version, setVersion] = useState(START.version)
  /** Bumping this remounts, replaying from frame one. */
  const [take, setTake] = useState(0)

  const hint = useRef<HTMLSpanElement | null>(null)
  const curtain = useRef<HTMLDivElement | null>(null)
  const label = useRef<HTMLDivElement | null>(null)
  const busy = useRef(false)

  const current = SECTIONS[section]
  const currentVersion = current.versions[version]
  const scrolls = assembled || currentVersion.scrolls

  /* Anything scroll-driven starts at the top with its triggers freshly
     measured, or it inherits the previous view's scroll position and
     begins halfway through itself. */
  useEffect(() => {
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [assembled, section, version, take])

  /* The cue guides the first screen and then gets out of the way. It sits
     bottom-centre, and Section 03's names travel straight through that
     spot — a permanent cue would be walked over by real content. */
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = hint.current
      if (!el) return
      const past = window.scrollY / Math.max(1, window.innerHeight * 0.5)
      el.style.opacity = String(Math.max(0, 1 - past))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [assembled, section, version, take])

  /** Cover, swap, uncover. */
  const wipe = useCallback((apply: () => void, title: string, num: string) => {
    const el = curtain.current
    if (!el || prefersReducedMotion()) {
      apply()
      return
    }
    if (busy.current) return
    busy.current = true

    if (label.current) {
      label.current.innerHTML =
        `<span class="${styles.curtainNum}">${num}</span>` +
        `<span class="label">${title}</span>`
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
      const target = SECTIONS[s].versions[clampedV]
      const same = !assembled && s === section && clampedV === version
      wipe(
        () => {
          if (same) setTake((t) => t + 1)
          setAssembled(false)
          setSection(s)
          setVersion(clampedV)
        },
        target.name,
        `${SECTIONS[s].num} · ${target.num}`
      )
    },
    [assembled, section, version, wipe]
  )

  const selectAssembled = useCallback(() => {
    wipe(
      () => {
        if (assembled) setTake((t) => t + 1)
        setAssembled(true)
      },
      'Hero → The Problem',
      'The page'
    )
  }, [assembled, wipe])

  const replay = useCallback(() => setTake((t) => t + 1), [])

  return (
    <>
      <StickyNav />

      <main className={styles.stage}>
        {assembled ? (
          <Assembled key={`page-${take}`} />
        ) : (
          <currentVersion.Component key={`${section}-${version}-${take}`} />
        )}

        {/* One stroke for whatever is mounted above, measured from it
            and painted over it. Keyed with the content so it always
            re-measures the page it is drawing. */}
        <Spine key={`spine-${assembled}-${section}-${version}-${take}`} />
      </main>

      {scrolls && (
        <span
          ref={hint}
          className={`${styles.scrollHint} label`}
          aria-hidden="true"
        >
          Scroll
          <span className={styles.scrollHintTick} />
        </span>
      )}

      <div className={styles.curtain} ref={curtain} aria-hidden="true">
        <div className={styles.curtainInner} ref={label} />
      </div>

      <VersionFab
        assembled={assembled}
        section={section}
        version={version}
        onSelect={select}
        onSelectAssembled={selectAssembled}
        onReplay={replay}
      />
    </>
  )
}
