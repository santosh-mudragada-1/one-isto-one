import {
  gsap,
  ScrollTrigger,
  SplitText,
  prefersReducedMotion,
} from '../../../lib/gsap'
import { useGsap } from '../../../lib/useGsap'
import PixelIcon, { type IconName } from '../../../components/PixelIcon'
import styles from './Mobile.module.css'

/* Six things a customer meets on one visit. One word each — a caption
   explaining a door is worse than no door. */
const CARDS: Array<{ icon: IconName; name: string }> = [
  { icon: 'door', name: 'Door' },
  { icon: 'phone', name: 'Phone' },
  { icon: 'cutlery', name: 'Menu' },
  { icon: 'bell', name: 'Service' },
  { icon: 'receipt', name: 'Receipt' },
  { icon: 'envelope', name: 'Email' },
]

/* ── the crossing ──────────────────────────────────────────────────
   Track distance between one card and the next, where 1 is the whole
   crossing. Smaller means more of them on screen at once. */
const APART = 0.235
/** How far each card is thrown off the line at full size. */
const LANES = [-72, 48, -30, 86, -58, 28]

/** Where each layer of a card opens, in track units, and over how
 *  long. Staggered so a piece ASSEMBLES rather than appears: the box
 *  unmasks, the object resolves inside it, then the name arrives. */
const LAYERS = { box: 0.05, glyph: 0.105, label: 0.155 }
const LAYER_OVER = 0.24

/* ── the heading's line ────────────────────────────────────────────
   The heading is real text on a real baseline now, so it can be split;
   the bend is applied per character instead, which keeps the curve
   smooth at any width. */

/** How far the line can bow, in px, at full speed. Small on purpose —
 *  it should read as the line breathing, not as an effect. */
const BEND = 26
/** Scroll speed, in px/s, that bows it that far. */
const FULL = 2600
/** How quickly it settles back to straight. */
const SETTLE = 0.06

/** Eased 0 → 1, flat at both ends. */
const smooth = (v: number) => {
  const x = v < 0 ? 0 : v > 1 ? 1 : v
  return x * x * (3 - 2 * x)
}

/**
 * 05 · 02 — MOVE ONE
 *
 * Two things happen here, driven by two different facts about the same
 * scroll.
 *
 * THE HEADING reveals once, by word, out from behind its own line, and
 * thereafter bows with scroll SPEED.
 *
 * THE SIX cross the screen on the spine itself, right to left, from
 * ONE master timeline: nothing at the edge, full size as they pass the
 * middle, nothing again as they leave. POSITION, not speed. You never
 * see all six at once, which is the point — a customer does not meet
 * them all at once either, and every one of them is on the same line.
 *
 * Everything the crossing does is a read of one number per card, and
 * every write is a transform. Nothing in here touches layout.
 */
export default function Mobile() {
  const root = useGsap<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope)
    const reduced = prefersReducedMotion()

    const head = q(`.${styles.headline}`)[0] as HTMLElement
    const slots = q(`.${styles.slot}`) as HTMLElement[]
    const cards = q(`.${styles.card}`) as HTMLElement[]
    const glyphs = q(`.${styles.glyph}`) as HTMLElement[]
    const labels = q(`.${styles.name}`) as HTMLElement[]
    const cue = q(`.${styles.cue}`)

    /* Measured on mount and on refresh. Nothing in the crossing reads
       the DOM per frame, so a card can never force a reflow. */
    let trackW = scope.clientWidth
    const measure = () => {
      trackW = scope.clientWidth
    }
    measure()

    /* Which objects have already been told to resolve. */
    const lit = cards.map(() => false)

    /* ── THE CROSSING ────────────────────────────────────────────
       One number per card decides everything about it: `t`, where it
       is on its own crossing — 0 at the right edge, 1 at the left. */
    const place = (p: number) => {
      const span = 1 + (cards.length - 1) * APART

      cards.forEach((card, i) => {
        const t = p * span - i * APART
        const slot = slots[i]

        if (t <= 0 || t >= 1) {
          if (slot.style.visibility !== 'hidden') slot.style.visibility = 'hidden'
          return
        }
        if (slot.style.visibility === 'hidden') slot.style.visibility = ''

        /* The crossing itself: nothing at the edges, full size through
           the middle. */
        const cross = Math.pow(Math.sin(Math.PI * t), 0.72)

        /* Each layer opens on its own beat and closes in the same
           order on the way out. */
        const layer = (from: number) =>
          Math.min(
            smooth((t - from) / LAYER_OVER),
            smooth((1 - from - t) / LAYER_OVER)
          )
        const box = layer(LAYERS.box)
        const glyph = layer(LAYERS.glyph)
        const label = layer(LAYERS.label)

        /* Position in px, never in percent: a percentage `left` would
           lay the section out again on every single frame. */
        const x = trackW * (1.02 - t * 1.04)
        const y = LANES[i % LANES.length] * cross + (1 - box) * 16
        slot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`

        /* The box opens from a slit at its own centre — a mask reveal
           rather than a fade — and scales from that same centre with
           the crossing. */
        card.style.transform = `translate(-50%, -50%) scale(${cross.toFixed(4)})`
        card.style.opacity = box.toFixed(3)
        card.style.clipPath = `inset(${((1 - box) * 50).toFixed(2)}% 0%)`

        /* The object, a beat behind the box it is in. */
        glyphs[i].style.transform = `scale(${(0.84 + glyph * 0.16).toFixed(4)})`
        glyphs[i].style.opacity = glyph.toFixed(3)

        /* The name, rising from behind its own line. */
        labels[i].style.transform = `translate3d(0, ${((1 - label) * 118).toFixed(1)}%, 0)`

        /* And the object resolves cell by cell as it settles — the
           pixel sweep the icons already own, rather than a second
           vocabulary for the same idea. An attribute, not a tween:
           the sweep is CSS and costs nothing to start. */
        const on = glyph > 0.55
        if (on !== lit[i]) {
          lit[i] = on
          if (on) glyphs[i].setAttribute('data-icon-live', '')
          else glyphs[i].removeAttribute('data-icon-live')
        }
      })
    }

    /* ── REDUCED MOTION ──────────────────────────────────────────
       Everything at rest, resolved, and nothing moves. */
    if (reduced) {
      place(0.5)
      gsap.set(cue, { opacity: 0 })
      return
    }

    /* ── ONE MASTER TIMELINE FOR THE CROSSING ────────────────────
       Every card is a read of the same progress, so nothing in this
       section can fall out of step with anything else in it. The
       timeline holds no tweens of its own — it exists to give the
       whole section a single scrubbed clock. */
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: (self) => place(self.progress),
      },
    })
    master.to({}, { duration: 1 })
    place(0)

    /* ── THE HEADING, REVEALED ONCE ──────────────────────────────
       Split three ways: the LINE is the mask the words come out from
       behind, the WORDS are what reveal, and the CHARS are what the
       bend below is applied to.

       Deliberately not on the master clock. This one fires once, when
       the section arrives, and never plays backwards — a heading that
       re-reveals every time you scroll past it is a heading nobody
       trusts. */
    const parts = SplitText.create(head, {
      type: 'lines,words,chars',
      mask: 'lines',
      autoSplit: true,
      wordsClass: styles.word,
      charsClass: styles.char,
      onSplit: (self) =>
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scope,
              /* The heading sits a quarter of a screen down inside the
                 pin, so a start measured off the SECTION has to allow
                 for that or the whole reveal plays below the fold. */
              start: 'top 58%',
              once: true,
            },
          })
          .from(self.words, {
            yPercent: 116,
            opacity: 0,
            filter: 'blur(9px)',
            duration: 1.15,
            ease: 'expo.out',
            stagger: { each: 0.07, from: 'start' },
            /* Dropped afterwards so the bend is writing to elements
               with nothing else left on them. */
            onComplete: () => gsap.set(self.words, { clearProps: 'filter' }),
          }),
    })

    /* ── THE BEND ────────────────────────────────────────────────
       Scroll SPEED, so it cannot come off the scrub and has to be
       measured per frame. Each character is offset against its own
       position along the line, which is what keeps the curve smooth
       rather than stepped. The phases are measured once, not per
       frame. */
    let phase: number[] = []
    const phases = () => {
      const box = head.getBoundingClientRect()
      const w = box.width || 1
      phase = parts.chars.map((c) => {
        const r = (c as HTMLElement).getBoundingClientRect()
        return Math.sin(((r.left + r.width / 2 - box.left) / w) * Math.PI * 2)
      })
    }
    phases()

    let bend = 0
    let seen = window.scrollY
    let cued = false

    const flex = () => {
      const now = window.scrollY
      const speed = (now - seen) * 60
      seen = now
      const want = gsap.utils.clamp(-1, 1, speed / FULL) * BEND
      bend += (want - bend) * (Math.abs(want) > Math.abs(bend) ? 0.3 : SETTLE)
      if (Math.abs(bend) < 0.05) return

      const chars = parts.chars as HTMLElement[]
      for (let i = 0; i < chars.length; i++) {
        chars[i].style.transform = `translate3d(0, ${(phase[i] * bend).toFixed(2)}px, 0)`
      }

      if (!cued && Math.abs(bend) > BEND * 0.4) {
        cued = true
        gsap.to(cue, { opacity: 0, duration: 0.5 })
      }
    }

    gsap.ticker.add(flex)

    const onResize = () => {
      measure()
      phases()
    }
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(flex)
      window.removeEventListener('resize', onResize)
      parts.revert()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      className={styles.root}
      data-surface="light"
      data-spine="studio"
      ref={root}
    >
      <div className={styles.pin} data-pin>
        <span className={`${styles.eyebrow} label`}>05 — The studio</span>

        <h2 className={styles.headline}>Move one. They all move.</h2>

        <span className={`${styles.cue} label`}>Scroll harder</span>

        {/* On the spine, which crosses this section at 60%. */}
        <div className={styles.track}>
          {CARDS.map((c) => (
            <div className={styles.slot} key={c.name}>
              <article className={styles.card}>
                <PixelIcon name={c.icon} className={styles.glyph} hover />
                <span className={styles.mask}>
                  <span className={`${styles.name} label`}>{c.name}</span>
                </span>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
