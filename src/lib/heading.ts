/**
 * Splits a heading into characters so it can be revealed letter by
 * letter rather than line by line.
 *
 * Hand-rolled rather than pulled from a plugin: the whole need is one
 * pass over a text node, and the markup has to stay predictable because
 * `.maskline` clips these from below.
 *
 * Spaces become non-breaking so an inline-block never collapses one, and
 * each word is kept whole so a heading still wraps at word boundaries.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('[data-char]'))
  }

  const text = el.textContent ?? ''
  el.textContent = ''
  const chars: HTMLElement[] = []

  text.split(/(\s+)/).forEach((chunk) => {
    if (!chunk) return

    if (/^\s+$/.test(chunk)) {
      const space = document.createElement('span')
      space.textContent = ' '
      space.style.display = 'inline-block'
      el.appendChild(space)
      return
    }

    /* One wrapper per word so lines break between words, never inside
       one — a per-character inline-block chain would wrap anywhere. */
    const word = document.createElement('span')
    word.style.display = 'inline-block'
    word.style.whiteSpace = 'nowrap'

    for (const c of chunk) {
      const span = document.createElement('span')
      span.dataset.char = ''
      span.textContent = c
      span.style.display = 'inline-block'
      span.style.willChange = 'transform'
      word.appendChild(span)
      chars.push(span)
    }

    el.appendChild(word)
  })

  el.dataset.split = 'done'
  return chars
}

/** Every character of every masked line inside a scope, in reading order. */
export function headingChars(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>('.maskline > span')).flatMap(
    (line) => splitChars(line)
  )
}

/**
 * The house heading reveal. Letters rise from behind their own line,
 * closely staggered — quick enough that the line still reads as a line
 * rather than as a row of animating letters.
 */
export const HEADING_REVEAL = {
  yPercent: 112,
  duration: 0.85,
  ease: 'power4.out',
  stagger: { each: 0.018, from: 'start' as const },
}
