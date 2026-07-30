import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { STRETCHES, VU, VW, type Stretch } from '../lib/spine'
import styles from './Spine.module.css'

/** The Hero's draw-on, in seconds. Short on purpose: a visitor who
 *  scrolls at once must never meet a line that starts in mid-air. */
const INTRO = 1.15
/** Where the head aims, in screens below the top of the window. Past
 *  the fold, never short of it — so once the stroke has caught up it
 *  always runs off the bottom edge rather than stopping at it. */
const LEAD = 0.06
/** The most the chase is ever allowed to fall behind the head, in
 *  screens. Without it the trail is a function of scroll speed and a
 *  hard flick opens a whole screen of nothing. */
const SLACK = 0.2
/** How much of the remaining ground the head makes up per frame at
 *  60fps. This is the whole reason the stroke reads as being DRAWN
 *  into a section rather than already waiting there: when the page
 *  advances, the head has ground to make up and you watch it make it
 *  up. Written as a rate rather than a tween so it is exact at any
 *  frame rate and has no lifecycle to get stuck in. */
const CHASE = 0.085
/** Past this much ground the head stops chasing and simply arrives.
 *  A version switch, a refresh partway down, an anchor jump — none of
 *  those are the page advancing, and none of them may leave the
 *  stroke half-drawn. */
const SNAP = 1.5
/** The Hero's corner marks, in px. */
const NODE = 9

/** A 1px stroke centred on a whole pixel straddles two of them. */
const crisp = (v: number) => Math.round(v) + 0.5

type Seg = { y0: number; y1: number; len: number; down: boolean }
type Node = { el: SVGRectElement; at: number; on: boolean }

/**
 * THE SPINE
 *
 * One stroke, one path, one element, for the whole page.
 *
 * ── why it is built this way ──────────────────────────────────────
 *
 * It used to be drawn per section, each stretch pinned inside its own
 * section and driven by that section's progress. Every join was then a
 * contract between two independent strokes that had to meet exactly,
 * and that contract broke five different ways: the svg clipped what
 * fell outside its viewBox, a wrapper isolated the blend, a stacking
 * context trapped the z-index, anisotropic viewBox scaling corrupted
 * the dash lengths, and — the one that survived every other fix —
 * sticky released a section's stretch a full screen early, so it
 * drifted upward for the last screen of every section and opened a gap
 * against the next one.
 *
 * There are no joins here to break. There is one polyline.
 *
 * ── how the two motions are separated ─────────────────────────────
 *
 * A section that pins holds one screen still for several screens of
 * scrolling, and the stroke has to hold still with it — that is why
 * this could never be a plain line drawn down the document.
 *
 * So the two are split, and each is given to whichever mechanism
 * cannot lag:
 *
 *   the window lock   `position: sticky` on the svg. The browser owns
 *                     it, so it is exact, and it holds for the entire
 *                     page rather than per section.
 *
 *   the line's own    one transform on one group, from `virtual()`.
 *   scroll            Constant while any section is pinned, 1:1 in
 *                     between.
 *
 * Which means that while a section is pinned — which is where the
 * stroke has to line up with real content, the base of the object in
 * 02, the margin rule in 04 — there is no JS moving anything at all.
 */
export default function Spine() {
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const nodesRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    const group = groupRef.current
    const path = pathRef.current
    const nodeBox = nodesRef.current
    if (!svg || !group || !path || !nodeBox) return

    const reduced = prefersReducedMotion()

    let pins: Array<{ a: number; b: number }> = []
    /** Real scroll → where the head should have reached, one section
     *  at a time. See `target`. */
    let pace: Array<{ s0: number; s1: number; t0: number; t1: number }> = []
    let segs: Seg[] = []
    let nodes: Node[] = []
    /** What the stroke finally lands on, if anything does. */
    let landing: HTMLElement | null = null
    let landed = false
    /** The last run across — held back and spent over the closing
     *  section, so the line arrives WHEN the page does. */
    let approach: { from: number; hold: number; last: number } | null = null
    let len = 0
    /** How far the page can scroll. Read in build, used to keep the
     *  line still while the window rubber-bands past either end. */
    let limit = 0
    let head = 0
    let lastShift = NaN
    let intro: gsap.core.Tween | null = null
    /** Where the page was standing when the opening draw began. */
    let opened = Infinity
    let started = false
    const state = { drawn: 0 }

    /**
     * Real scroll → the line's own scroll.
     *
     * A pinned section holds its screen still, so it contributes
     * nothing here; everything else is 1:1. This is the only place the
     * page's structure enters the geometry, and it is measured, never
     * assumed.
     */
    const virtual = (s: number) => {
      let v = s
      for (const p of pins) {
        if (s <= p.a) break
        v -= Math.min(s, p.b) - p.a
      }
      return v
    }

    /**
     * Where the head should have reached, in the line's own space.
     *
     * NOT `virtual`. Virtual scroll is frozen while a section holds
     * its screen still — right for placing the line, useless for
     * pacing it, because the head would freeze too and the stroke
     * would simply be there. So each section's stretch of line is
     * spent across that section's real scroll instead: it draws in as
     * you come down through a section and un-draws as you go back up,
     * and it runs out exactly as the section does.
     */
    const target = (s: number) => {
      if (!pace.length) return virtual(s) + window.innerHeight
      if (s <= pace[0].s0) return pace[0].t0
      for (const p of pace) {
        if (s >= p.s1) continue
        const span = p.s1 - p.s0
        return span > 0 ? p.t0 + ((s - p.s0) / span) * (p.t1 - p.t0) : p.t1
      }
      return pace[pace.length - 1].t1
    }

    /** How much of the stroke has been reached by the time the line
     *  has descended to `y`. A run across counts the moment the
     *  descent above it arrives — the chase then sweeps it. */
    const lengthAt = (y: number) => {
      let cum = 0
      for (const s of segs) {
        if (s.down) {
          if (y <= s.y0) return cum
          if (y < s.y1) return cum + (y - s.y0)
        } else if (y < s.y0) {
          return cum
        }
        cum += s.len
      }
      return cum
    }

    const paint = () => {
      path.style.strokeDashoffset = String(len - state.drawn)

      /* Whatever the stroke ends on is told when the stroke gets
         there, rather than being timed to match it. One source of
         truth: if it is marked, the line is actually touching it. */
      if (landing) {
        const on = state.drawn >= len - 1
        if (on !== landed) {
          landed = on
          landing.toggleAttribute('data-reached', on)
        }
      }

      for (const n of nodes) {
        const on = state.drawn >= n.at
        if (on === n.on) continue
        n.on = on
        /* Each corner lights at the moment the stroke reaches it, and
           goes out again if the stroke is taken back off it — read
           off the stroke itself, never timed to match it. */
        gsap.killTweensOf(n.el)
        if (!on) gsap.set(n.el, { opacity: 0, scale: 0.4 })
        else if (reduced) gsap.set(n.el, { opacity: 1, scale: 1 })
        else
          gsap.fromTo(
            n.el,
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
          )
      }
    }

    const build = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      const marks = Array.from(document.querySelectorAll<HTMLElement>('[data-spine]'))

      pins = []
      pace = []
      segs = []
      nodes = []
      nodeBox.replaceChildren()

      svg.setAttribute('width', String(vw))
      svg.setAttribute('height', String(vh))
      svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`)

      const all = marks.map((el) => {
        const r = el.getBoundingClientRect()
        const pin = el.querySelector<HTMLElement>('[data-pin]')
        return {
          el,
          pin,
          stretch: STRETCHES[el.dataset.spine ?? ''] as Stretch | undefined,
          top: r.top + window.scrollY,
          height: r.height,
          /* The screen this section holds still — measured, because
             100dvh and innerHeight are not the same number on every
             device, and every y in a stretch is a fraction of it.
             Taken from the rect, not offsetHeight, so a fractional
             screen does not accumulate a pixel of error per section
             all the way down the page. */
          unit: pin ? pin.getBoundingClientRect().height : Math.min(r.height, vh),
        }
      })

      /* A sticky screen holds from the moment its section's top meets
         the top of the window until its bottom meets the bottom.

         Taken from EVERY marked section, including any whose stretch
         is not in the table yet: a section the line has no geometry
         for still stops the page, and if it were left out here the
         whole line would scroll away through it. */
      for (const r of all) {
        const hold = r.height - (r.pin ? r.unit : r.height)
        if (hold > 1) pins.push({ a: r.top, b: r.top + hold })
      }
      pins.sort((m, n) => m.a - n.a)

      const rows = all.filter(
        (r): r is typeof r & { stretch: Stretch } => !!r.stretch
      )

      const tail = all[all.length - 1]
      limit = tail ? Math.max(0, tail.top + tail.height - vh) : 0

      if (!rows.length) {
        path.setAttribute('d', '')
        len = 0
        return
      }

      /* One section of line per section of page, and the head is
         given a head start of exactly the amount it will lose to the
         pin: a section that holds its screen for (height - unit) of
         scrolling ends with its head one screen further down than it
         started, so starting it `unit/height` of a screen down puts
         the tip on the bottom edge at the moment the section runs
         out — and never before.

         The Hero is the same rule with nothing subtracted, because it
         holds nothing: height === unit, so its lead is a full screen
         and its stroke is complete the instant it has drawn. */
      const lead = (r: (typeof rows)[number]) =>
        virtual(r.top) + (LEAD + r.unit / Math.max(r.unit, r.height)) * r.unit

      rows.forEach((r, i) => {
        const next = rows[i + 1]
        pace.push({
          s0: r.top,
          s1: next ? next.top : Math.max(r.top + 1, limit),
          t0: lead(r),
          t1: next ? lead(next) : virtual(limit) + (1 + LEAD) * r.unit,
        })
      })

      const px = (x: number) => crisp((x / VW) * vw)

      /* Walk every stretch in order. Each section continues from
         wherever the last one left the stroke — `enter` is only read
         for the first, so two sections cannot disagree. */
      let x = px(rows[0].stretch.enter)
      let y = crisp(virtual(rows[0].top) - rows[0].unit * 0.02)
      const pts: Array<{ x: number; y: number }> = [{ x, y }]
      const corners: number[] = []

      for (const r of rows) {
        const base = virtual(r.top)
        for (const t of r.stretch.turns) {
          /* Never allowed to double back: the head's position along
             the stroke is a function of how far it has descended. */
          const ty = Math.max(y, crisp(base + (t.y / VU) * r.unit))
          const tx = px(t.x)
          pts.push({ x, y: ty }, { x: tx, y: ty })
          if (t.node) corners.push(pts.length - 2, pts.length - 1)
          x = tx
          y = ty
        }
      }

      /* How it ends. A closing section can name the exact thing the
         stroke lands on — after fifteen screens the line stops on a
         full stop, and it stops on the REAL one, measured, so it is
         still exact at any width. Everywhere else the stroke simply
         runs off the bottom edge rather than stopping on it. */
      const last = rows[rows.length - 1]
      const mark = last.stretch.end
        ? last.el.querySelector<HTMLElement>(last.stretch.end)
        : null

      landing?.removeAttribute('data-reached')
      landing = mark
      landed = false
      approach = null

      if (mark && last.pin) {
        const held = last.pin.getBoundingClientRect()
        const box = mark.getBoundingClientRect()
        const ty = Math.max(y, crisp(virtual(last.top) + (box.top + box.height / 2 - held.top)))
        const tx = crisp(box.left + box.width / 2 - held.left)
        pts.push({ x, y: ty }, { x: tx, y: ty })
        x = tx
        y = ty
        /* In REAL scroll, not the line's own: this section holds its
           screen still, so its virtual scroll does not move at all
           and could not pace anything. The last move is the one thing
           on the page paid for in actual scrolling.
           `from` is filled in below, once the run's length is known. */
        approach = {
          from: 0,
          hold: last.top,
          last: Math.max(last.top, last.top + last.height - vh),
        }
      } else {
        const bottom = Math.max(0, last.top + last.height - vh)
        pts.push({ x, y: crisp(virtual(bottom) + vh + last.unit * 0.3) })
      }

      let d = `M ${pts[0].x} ${pts[0].y}`
      const reach: number[] = [0]
      len = 0

      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const l = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
        if (l > 0) {
          d += ` L ${b.x} ${b.y}`
          segs.push({ y0: a.y, y1: b.y, len: l, down: b.y !== a.y })
          len += l
        }
        reach.push(len)
      }

      path.setAttribute('d', d)

      /* Everything except the very last move. Aiming a screen ahead
         of the fold would otherwise finish the line while the closing
         section is still below the window, and the one moment this
         stroke has been running fifteen screens toward would happen
         off screen. */
      if (approach && segs.length) approach.from = len - segs[segs.length - 1].len

      head = Math.min(len, lengthAt(target(gsap.utils.clamp(0, limit, window.scrollY))))

      if (reduced) {
        path.style.strokeDasharray = 'none'
        state.drawn = len
      } else {
        path.style.strokeDasharray = String(len)
        /* Nothing drawn yet if the opener is about to draw it — the
           corner marks below read this, and marks that are already
           lit before the stroke has moved are marks that mean
           nothing. */
        if (opens && !started) state.drawn = 0
        else if (!intro?.isActive()) state.drawn = head
      }

      for (const i of corners) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        el.setAttribute('class', styles.node)
        el.setAttribute('x', String(pts[i].x - NODE / 2))
        el.setAttribute('y', String(pts[i].y - NODE / 2))
        el.setAttribute('width', String(NODE))
        el.setAttribute('height', String(NODE))
        /* A corner the stroke has ALREADY passed is simply there. Only
           an arriving stroke lights one; a re-measure must not. */
        const on = state.drawn >= reach[i]
        el.setAttribute('opacity', on ? '1' : '0')
        nodeBox.appendChild(el)
        nodes.push({ el, at: reach[i], on })
      }

      paint()
    }

    /* The Hero draws itself in, once, on a fresh load. Nowhere else:
       every other section's stroke arrives by being scrolled to. */
    const opener = document.querySelector<HTMLElement>('[data-spine]')
    const opens = !reduced && !!STRETCHES[opener?.dataset.spine ?? '']?.intro

    build()

    if (!reduced && opens && len > 0) {
      state.drawn = 0
      paint()
      intro = gsap.to(state, {
        drawn: () => head,
        duration: INTRO,
        ease: 'power2.inOut',
        onUpdate: paint,
      })
    }
    started = true

    /* The default delta settles the head immediately, which is what a
       direct call means: a rebuild, not a frame. */
    const tick = (_time = 0, delta = 1000) => {
      /* Clamped: a rubber-banding window scrolls past both ends, and
         the sticky svg is already carried by that — moving the line
         as well would double it. */
      const scroll = gsap.utils.clamp(0, limit, window.scrollY)
      const vh = window.innerHeight
      const v = virtual(scroll)
      /* Rounded so verticals stay on the half-pixel grid they were
         built on. Half a pixel of position for a hairline that stays
         a hairline is the right trade. */
      const shift = Math.round(v)
      if (shift !== lastShift) {
        lastShift = shift
        group.setAttribute('transform', `translate(0 ${-shift})`)
      }
      if (reduced || !len) return

      /* A pure function of where the page is — not a one-way
         animation. Scroll back and the head comes back with you: the
         stroke is drawn by your journey, so it un-draws when you
         retrace it. */
      head = Math.min(len, lengthAt(target(scroll)))

      /* The last move is spent across the closing section rather than
         given away early, so the stroke lands as the page ends. */
      if (approach) {
        const span = approach.last - approach.hold
        const t = span > 0 ? gsap.utils.clamp(0, 1, (scroll - approach.hold) / span) : 1
        head = Math.min(head, approach.from + (len - approach.from) * t)
      }

      /* The opening draw owns the stroke only while the page is still
         standing where it started. The moment it is scrolled, the
         scroll owns it — otherwise a visitor who moves during the
         first second watches the window empty out behind them. */
      if (intro?.isActive()) {
        opened = Math.min(opened, scroll)
        if (scroll - opened < 24) return
        intro.kill()
        intro = null
      }

      let drawn = state.drawn
      const gap = head - drawn
      if (gap !== 0) {
        const far = Math.abs(gap)
        drawn =
          far <= 0.5 || far > window.innerHeight * SNAP
            ? head
            : drawn + gap * (1 - Math.pow(1 - CHASE, delta / 16.667))
      }

      /* The chase may trail — that is what makes the stroke read as
         being drawn — but only ever by this much, whatever speed the
         page is thrown at. */
      const least = head - vh * SLACK
      if (drawn < least) drawn = least

      if (drawn === state.drawn) return
      state.drawn = drawn
      paint()
    }

    gsap.ticker.add(tick)
    tick()

    let pending = 0
    const relayout = () => {
      /* Immediately, every event: the svg clips to its own box, so a
         box that lags a drag-resize by 140ms is a stroke that stops
         short of the bottom edge for 140ms. */
      svg.setAttribute('width', String(window.innerWidth))
      svg.setAttribute('height', String(window.innerHeight))
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`)
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        build()
        lastShift = NaN
        tick()
      }, 140)
    }
    const onRefresh = () => {
      build()
      lastShift = NaN
      tick()
    }

    window.addEventListener('resize', relayout)
    ScrollTrigger.addEventListener('refresh', onRefresh)

    /* Anything the stroke lands ON is measured from laid-out type, so
       it has to be measured again once the real face has arrived. */
    let dead = false
    document.fonts?.ready.then(() => {
      if (!dead) onRefresh()
    })

    return () => {
      dead = true
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', relayout)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      window.clearTimeout(pending)
      intro?.kill()
      gsap.killTweensOf(state)
      nodes.forEach((n) => gsap.killTweensOf(n.el))
    }
  }, [])

  return (
    <div className={styles.field} aria-hidden="true">
      <svg className={styles.spine} ref={svgRef} width="0" height="0">
        <g ref={groupRef}>
          <path className={styles.path} ref={pathRef} d="" />
          {/* Owned by the effect, never by React. */}
          <g ref={nodesRef} />
        </g>
      </svg>
    </div>
  )
}
