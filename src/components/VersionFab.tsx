import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { SECTIONS } from '../sections'
import styles from './VersionFab.module.css'

type Props = {
  assembled: boolean
  section: number
  version: number
  onSelect: (section: number, version: number) => void
  onSelectAssembled: () => void
  onReplay: () => void
}

export default function VersionFab({
  assembled,
  section,
  version,
  onSelect,
  onSelectAssembled,
  onReplay,
}: Props) {
  const [open, setOpen] = useState(false)
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

  /* Digits match the number printed on the row rather than its position,
     so `4` still selects 04 after 02 and 03 were deleted. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return

      if (e.key === '0') {
        onSelectAssembled()
      } else if (/^[0-9]$/.test(e.key)) {
        const i = SECTIONS[section].versions.findIndex(
          (v) => Number(v.num) === Number(e.key)
        )
        if (i >= 0) onSelect(section, i)
      } else if (e.key === 'ArrowDown' || e.key === ']') {
        e.preventDefault()
        onSelect(Math.min(section + 1, SECTIONS.length - 1), version)
      } else if (e.key === 'ArrowUp' || e.key === '[') {
        e.preventDefault()
        onSelect(Math.max(section - 1, 0), version)
      } else if (e.key.toLowerCase() === 'r') {
        onReplay()
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, version, onSelect, onSelectAssembled, onReplay])

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
        {/* The chosen directions, in sequence, as one scroll. */}
        <div className={styles.group}>
          <div className={`${styles.groupHead} label`}>
            <span>The page</span>
            <span>Assembled</span>
          </div>
          <button
            className={`${styles.row} ${assembled ? styles.rowActive : ''}`}
            role="option"
            aria-selected={assembled}
            title="The finalised sections in sequence, with one continuous line"
            onClick={() => {
              onSelectAssembled()
              setOpen(false)
            }}
          >
            <span className={styles.rowNum}>00</span>
            <span className={styles.rowName}>Hero → The Problem</span>
            <span className={styles.rowDot} />
          </button>
        </div>

        {SECTIONS.map((s, si) => (
          <div key={s.id} className={styles.group}>
            <div className={`${styles.groupHead} label`}>
              <span>Section {s.num}</span>
              <span>{s.name}</span>
            </div>
            <span className={styles.groupIntent}>{s.intent}</span>

            {s.versions.map((v, vi) => {
              const active = !assembled && si === section && vi === version
              return (
                <button
                  key={v.id}
                  className={`${styles.row} ${active ? styles.rowActive : ''}`}
                  role="option"
                  aria-selected={active}
                  title={v.signature}
                  onClick={() => {
                    onSelect(si, vi)
                    setOpen(false)
                  }}
                >
                  <span className={styles.rowNum}>{v.num}</span>
                  <span className={styles.rowName}>{v.name}</span>
                  {v.status && (
                    <span
                      className={`${styles.chip} ${
                        v.status === 'final' ? styles.chipFinal : ''
                      }`}
                    >
                      {v.status === 'final' ? 'Final' : 'Ref'}
                    </span>
                  )}
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
          onClick={onReplay}
          aria-label="Replay this version"
          title="Replay (R)"
        >
          <svg className={styles.icon} viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 1 1-2.6-5.9" />
            <path d="M20 4v5h-5" />
          </svg>
        </button>

        <button
          className={styles.main}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Choose section and version"
        >
          <span className={styles.mainNum}>
            {assembled ? '00' : `${current.num} · ${currentVersion.num}`}
          </span>
          <span className={`${styles.mainLabel} label`}>
            {assembled ? 'The page' : currentVersion.name}
          </span>
          <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`} />
        </button>
      </div>
    </div>
  )
}
