import NavLogo, { type Tone } from './NavLogo'
import styles from './TopBar.module.css'

type Props = {
  /** Surface the links sit on. */
  tone?: Tone
  /** Surface the wordmark sits on — differs when a concept splits the
   *  screen into two surfaces, as concept 05 does. Defaults to `tone`. */
  logoTone?: Tone
}

const LINKS = [
  { label: 'Thinking', href: '#thinking' },
  { label: 'Studio', href: '#studio' },
]

export default function TopBar({ tone = 'dark', logoTone }: Props) {
  return (
    <div
      className={`${styles.bar} ${tone === 'light' ? styles.light : styles.dark}`}
    >
      <a
        className={styles.logoLink}
        href="#top"
        aria-label="one to one — home"
      >
        <NavLogo tone={logoTone ?? tone} height={20} />
      </a>

      <nav className={styles.links}>
        {LINKS.map((l) => (
          <a
            key={l.href}
            className={styles.link}
            href={l.href}
          >
            {l.label}
            <span className={styles.rule} />
          </a>
        ))}

        <a
          className={`${styles.cta} chamfer-box`}
          href="#contact"
        >
          <span>Start a conversation</span>
        </a>
      </nav>
    </div>
  )
}
