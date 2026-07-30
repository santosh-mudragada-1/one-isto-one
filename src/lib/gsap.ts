import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(Flip, Observer, ScrollTrigger, SplitText)

/* House easing. Nothing overshoots, nothing bounces — the mark is
   machined, and machined things land rather than wobble. */
gsap.defaults({ ease: 'power3.out', duration: 0.8 })

export { gsap, Flip, Observer, ScrollTrigger, SplitText }

/** True when the visitor has asked the OS for less motion. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
