import { useLayoutEffect, useRef, type DependencyList } from 'react'
import { gsap } from './gsap'

/**
 * Scoped GSAP effect. Everything created inside `fn` is collected in a
 * context and reverted on unmount, so switching concepts leaves no
 * inline styles or live tweens behind — and StrictMode's double mount
 * in dev is harmless.
 */
export function useGsap<T extends HTMLElement>(
  fn: (scope: T) => void,
  deps: DependencyList = []
) {
  const scope = useRef<T | null>(null)

  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const ctx = gsap.context(() => fn(el), el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}
