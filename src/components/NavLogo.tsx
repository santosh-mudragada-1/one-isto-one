import styles from './NavLogo.module.css'

/** `tone` describes the SURFACE the logo sits on, not the logo itself. */
export type Tone = 'light' | 'dark'

type Props = {
  /** 'light' = light background → dark wordmark (Logo-10).
   *  'dark'  = dark background  → light wordmark (Logo-12). */
  tone: Tone
  /** Cap height of the wordmark in px. */
  height?: number
  className?: string
}

/* Files in Public/ are served verbatim, so they have to be addressed
   through the configured base — otherwise they 404 anywhere the site
   is not at the domain root. */
const asset = (file: string) => `${import.meta.env.BASE_URL}Logos/${file}`

export default function NavLogo({ tone, height = 14, className }: Props) {
  const onLight = tone === 'light'

  return (
    <span
      className={`${styles.root} ${className ?? ''}`}
      style={{ ['--h' as string]: `${height}px` }}
      role="img"
      aria-label="one to one"
    >
      <img
        className={`${styles.img} ${onLight ? styles.on : styles.off}`}
        src={asset('Logo-10.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <img
        className={`${styles.img} ${onLight ? styles.off : styles.on}`}
        src={asset('Logo-12.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </span>
  )
}
