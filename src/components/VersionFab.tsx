import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { sfx, setSound, soundEnabled } from '../lib/sound'
import { CONCEPTS } from '../heroes'
import styles from './VersionFab.module.css'

type Props = {
  index: number
  onSelect: (i: number) => void
  onReplay: () => void
}

export default function VersionFab({ index, onSelect, onReplay }: Props) {
  const [open, setOpen] = useState(false)
  const [sound, setSoundState] = useState(soundEnabled())
  const panelRef = useRef<HTMLDivElement | null>(null)
  const rowsRef = useRef<HTMLDivElement | null>(null)

  /* Open / close. The panel is display:none while closed so it never
     traps focus or intercepts a pointer over the hero. */
  useEffect(() => {
    const panel = panelRef.current
    const rows = rowsRef.current
    if (!panel || !rows) return

    const items = rows.children
    if (prefersReducedMotion()) {
      gsap.set(panel, { opacity: open ? 1 : 0 })
      gsap.set(items, { opacity: open ? 1 : 0, y: 0 })
      return
    }

    if (open) {
      gsap
        .timeline()
        .fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 })
        .fromTo(
          items,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.045 },
          0.05
        )
    } else {
      gsap.to(panel, { opacity: 0, y: 8, duration: 0.22, ease: 'power2.in' })
    }
  }, [open])

  /* Keyboard: 1–5 switch, R replays, S toggles sound, Esc closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return

      if (e.key >= '1' && e.key <= String(CONCEPTS.length)) {
        onSelect(Number(e.key) - 1)
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
  }, [onSelect, onReplay])

  function toggleSound() {
    const next = !soundEnabled()
    setSound(next)
    setSoundState(next)
    if (next) sfx.click()
  }

  const current = CONCEPTS[index]

  return (
    <div className={styles.root}>
      <div
        ref={panelRef}
        className={`${styles.panel} chamfer ${open ? '' : styles.panelHidden}`}
        role="listbox"
        aria-label="Hero concept"
      >
        <div className={`${styles.panelHead} label`}>
          <span>Hero concept</span>
          <span>{CONCEPTS.length} directions</span>
        </div>

        <div ref={rowsRef}>
          {CONCEPTS.map((c, i) => (
            <button
              key={c.id}
              className={`${styles.row} ${i === index ? styles.rowActive : ''}`}
              role="option"
              aria-selected={i === index}
              onMouseEnter={() => sfx.hover()}
              onClick={() => {
                onSelect(i)
                sfx.click()
                setOpen(false)
              }}
            >
              <span className={styles.rowNum}>{c.num}</span>
              <span className={styles.rowName}>{c.name}</span>
              <span className={styles.rowDot} />
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.cluster} chamfer`}>
        <button
          className={styles.util}
          onClick={() => {
            onReplay()
            sfx.click()
          }}
          onMouseEnter={() => sfx.hover()}
          aria-label="Replay this concept"
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
          aria-label="Choose hero concept"
        >
          <span className={styles.mainNum}>{current.num}</span>
          <span className={`${styles.mainLabel} label`}>{current.name}</span>
          <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} />
        </button>
      </div>
    </div>
  )
}
