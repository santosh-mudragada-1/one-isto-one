import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { sfx, setSound, soundEnabled } from '../lib/sound'
import { SECTIONS } from '../sections'
import styles from './VersionFab.module.css'

type Props = {
  section: number
  version: number
  onSelect: (section: number, version: number) => void
  onReplay: () => void
}

export default function VersionFab({
  section,
  version,
  onSelect,
  onReplay,
}: Props) {
  const [open, setOpen] = useState(false)
  const [sound, setSoundState] = useState(soundEnabled())
  const panelRef = useRef<HTMLDivElement | null>(null)

  /* Open / close. The panel is display:none while closed so it never
     traps focus or intercepts a pointer over the section. */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const rows = panel.querySelectorAll(`.${styles.row}`)

    if (prefersReducedMotion()) {
      gsap.set(panel, { opacity: open ? 1 : 0 })
      gsap.set(rows, { opacity: open ? 1 : 0, y: 0 })
      return
    }

    if (open) {
      gsap
        .timeline()
        .fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 })
        .fromTo(
          rows,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.028 },
          0.05
        )
    } else {
      gsap.to(panel, { opacity: 0, y: 8, duration: 0.22, ease: 'power2.in' })
    }
  }, [open])

  /* Keyboard: digits pick a version inside the current section, arrows
     move between sections. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return

      const versions = SECTIONS[section].versions

      if (e.key >= '1' && e.key <= String(versions.length)) {
        onSelect(section, Number(e.key) - 1)
        sfx.click()
      } else if (e.key === 'ArrowDown' || e.key === ']') {
        e.preventDefault()
        onSelect(Math.min(section + 1, SECTIONS.length - 1), version)
        sfx.click()
      } else if (e.key === 'ArrowUp' || e.key === '[') {
        e.preventDefault()
        onSelect(Math.max(section - 1, 0), version)
        sfx.click()
      } else if (e.key.toLowerCase() === 'r') {
        onReplay()
      } else if (e.key.toLowerCase() === 's') {
        toggleSound()
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, version, onSelect, onReplay])

  function toggleSound() {
    const next = !soundEnabled()
    setSound(next)
    setSoundState(next)
    if (next) sfx.click()
  }

  const current = SECTIONS[section]
  const currentVersion = current.versions[version]

  return (
    <div className={styles.root}>
      <div
        ref={panelRef}
        className={`${styles.panel} chamfer ${open ? '' : styles.panelHidden}`}
        role="listbox"
        aria-label="Section and version"
      >
        {SECTIONS.map((s, si) => (
          <div key={s.id} className={styles.group}>
            <div className={`${styles.groupHead} label`}>
              <span>Section {s.num}</span>
              <span>{s.name}</span>
            </div>
            <span className={styles.groupIntent}>{s.intent}</span>

            {s.versions.map((v, vi) => {
              const active = si === section && vi === version
              return (
                <button
                  key={v.id}
                  className={`${styles.row} ${active ? styles.rowActive : ''}`}
                  role="option"
                  aria-selected={active}
                  title={v.signature}
                  onMouseEnter={() => sfx.hover()}
                  onClick={() => {
                    onSelect(si, vi)
                    sfx.click()
                    setOpen(false)
                  }}
                >
                  <span className={styles.rowNum}>{v.num}</span>
                  <span className={styles.rowName}>{v.name}</span>
                  <span className={styles.rowDot} />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={`${styles.cluster} chamfer`}>
        <button
          className={styles.util}
          onClick={() => {
            onReplay()
            sfx.click()
          }}
          onMouseEnter={() => sfx.hover()}
          aria-label="Replay this version"
          title="Replay (R)"
        >
          <svg className={styles.icon} viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 1 1-2.6-5.9" />
            <path d="M20 4v5h-5" />
          </svg>
        </button>

        <button
          className={`${styles.util} ${sound ? styles.utilOn : ''}`}
          onClick={toggleSound}
          onMouseEnter={() => sfx.hover()}
          aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
          aria-pressed={sound}
          title="Sound (S)"
        >
          <svg className={styles.icon} viewBox="0 0 24 24">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {sound ? (
              <>
                <path d="M16.5 8.5a5 5 0 0 1 0 7" />
                <path d="M19 6a8.5 8.5 0 0 1 0 12" />
              </>
            ) : (
              <path d="M17 9.5l4 5m0-5l-4 5" />
            )}
          </svg>
        </button>

        <button
          className={styles.main}
          onClick={() => {
            setOpen((v) => !v)
            sfx.click()
          }}
          onMouseEnter={() => sfx.hover()}
          aria-expanded={open}
          aria-label="Choose section and version"
        >
          <span className={styles.mainNum}>
            {current.num} · {currentVersion.num}
          </span>
          <span className={`${styles.mainLabel} label`}>
            {currentVersion.name}
          </span>
          <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} />
        </button>
      </div>
    </div>
  )
}
