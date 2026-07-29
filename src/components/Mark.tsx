/**
 * The 1:1 symbol, redrawn as vector from the supplied PNG so it can be
 * scaled, coloured with `currentColor` and animated path-by-path.
 * Geometry is traced from Logo-01: two numerals whose top-right corner
 * is cut at 45°, held apart by two perfect squares.
 */
export default function Mark({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 502 490"
      fill="currentColor"
      role="img"
      aria-label="1:1"
    >
      {/* left numeral */}
      <path d="M0 0 H87 L132 45 V490 H43 V50 H0 Z" data-mark="one-a" />
      {/* the interval — the loudest part of the mark */}
      <rect x="217" y="108" width="98" height="98" data-mark="colon-a" />
      <rect x="217" y="284" width="98" height="98" data-mark="colon-b" />
      {/* right numeral */}
      <path d="M370 0 H457 L502 45 V490 H413 V50 H370 Z" data-mark="one-b" />
    </svg>
  )
}
