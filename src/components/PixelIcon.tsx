import styles from './PixelIcon.module.css'

/**
 * Pixel objects, drawn on a 12×12 grid and extruded.
 *
 * A pixel grid is not a costume here — the identity is already built on
 * a square module (the two dots of the colon) and a 45° cut, so an
 * object made of squares with a 45° bevel is the same system at a
 * different scale.
 *
 * `#` is solid, `.` is empty. Each solid cell is drawn twice: once
 * offset down-right in a mid grey for the extrusion, once on top in
 * ink. One map, two passes, no per-icon shading to maintain.
 */
const MAPS: Record<string, string[]> = {
  // a hanging shopfront sign
  sign: [
    '............',
    '..########..',
    '..#......#..',
    '..#.####.#..',
    '..#......#..',
    '..########..',
    '.....##.....',
    '.....##.....',
    '....####....',
    '...######...',
    '............',
    '............',
  ],
  // a browser window
  browser: [
    '............',
    '.##########.',
    '.#........#.',
    '.#.#.#.#..#.',
    '.##########.',
    '.#........#.',
    '.#.######.#.',
    '.#.####...#.',
    '.#.#####..#.',
    '.#........#.',
    '.##########.',
    '............',
  ],
  // an armchair
  chair: [
    '............',
    '...######...',
    '..########..',
    '..##....##..',
    '..##....##..',
    '..########..',
    '..########..',
    '...#....#...',
    '...#....#...',
    '............',
    '............',
    '............',
  ],
  // a horn, pointing out
  horn: [
    '............',
    '.......###..',
    '.....#####..',
    '...#######..',
    '..########..',
    '..########..',
    '...#######..',
    '.....#####..',
    '.......###..',
    '............',
    '............',
    '............',
  ],
  // a terminal, with a prompt
  terminal: [
    '............',
    '.##########.',
    '.#........#.',
    '.#.##.....#.',
    '.#...##...#.',
    '.#.##.....#.',
    '.#........#.',
    '.#..#####.#.',
    '.#........#.',
    '.##########.',
    '............',
    '............',
  ],
  // bars, going up
  chart: [
    '............',
    '.#..........',
    '.#.......##.',
    '.#....##.##.',
    '.#....##.##.',
    '.#.##.##.##.',
    '.#.##.##.##.',
    '.#.##.##.##.',
    '.##########.',
    '............',
    '............',
    '............',
  ],
}

export type IconName = keyof typeof MAPS

/** How far the extrusion is thrown. Under 1 so it reads as solid. */
const DEPTH = 0.62

export default function PixelIcon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  const cells: Array<[number, number]> = []
  MAPS[name].forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === '#') cells.push([x, y])
    })
  )

  return (
    <svg
      className={`${styles.icon} ${className ?? ''}`}
      viewBox={`0 0 ${12 + DEPTH} ${12 + DEPTH}`}
      aria-hidden="true"
    >
      <g className={styles.extrude}>
        {cells.map(([x, y]) => (
          <rect key={`e${x}-${y}`} x={x + DEPTH} y={y + DEPTH} width="1" height="1" />
        ))}
      </g>
      <g className={styles.face}>
        {cells.map(([x, y]) => (
          <rect
            key={`f${x}-${y}`}
            className={styles.px}
            data-px=""
            x={x}
            y={y}
            width="1"
            height="1"
          />
        ))}
      </g>
    </svg>
  )
}
