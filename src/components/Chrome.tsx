import TopBar from './TopBar'
import type { Tone } from './NavLogo'
import styles from './Chrome.module.css'

type Props = {
  /** The surface the chrome sits on. */
  tone?: Tone
  /** Hide the lower bar when a concept owns the bottom of the frame. */
  showFooter?: boolean
}

/**
 * The persistent frame every concept shares. Deliberately almost
 * invisible — hierarchy comes from type and space, not rules and boxes.
 * The single exception is the call to action, which is the one thing
 * the whole site is asking for.
 */
export default function Chrome({ tone = 'dark', showFooter = true }: Props) {
  return (
    <>
      <TopBar tone={tone} />

      {showFooter && (
        <div
          className={`${styles.bottom} ${tone === 'light' ? styles.light : styles.dark}`}
        >
          <span className={`${styles.meta} label`}>India — 2026</span>
          <span className={`${styles.cue} label`}>
            Scroll
            <span className={styles.tick} />
          </span>
        </div>
      )}
    </>
  )
}
