/* ============================================================
   Sound
   Synthesised on the fly — no audio files to load, nothing to
   wait for. Off by default: sound is an offer, never an ambush.
   ============================================================ */

let ctx: AudioContext | null = null
let enabled = false

const listeners = new Set<(on: boolean) => void>()

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const soundEnabled = () => enabled

export function setSound(on: boolean) {
  enabled = on
  if (on) context()
  listeners.forEach((fn) => fn(on))
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Short burst of filtered noise — the "material" in every cue. */
function noise(duration: number, freq: number, q: number, gain: number) {
  const ac = context()
  if (!ac) return
  const frames = Math.max(1, Math.floor(ac.sampleRate * duration))
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    // Fade the noise across the buffer so it reads as a tap, not a hiss.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = q

  const amp = ac.createGain()
  amp.gain.setValueAtTime(gain, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)

  src.connect(filter).connect(amp).connect(ac.destination)
  src.start()
  src.stop(ac.currentTime + duration)
}

/** Pitched body — gives a cue weight without making it a "beep". */
function tone(freq: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  const ac = context()
  if (!ac) return
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.72, ac.currentTime + duration)

  const amp = ac.createGain()
  amp.gain.setValueAtTime(0.0001, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.006)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export const sfx = {
  /** Barely-there tick for hover. */
  hover() {
    if (!enabled) return
    noise(0.03, 5200, 1.4, 0.014)
  },
  /** Soft click for a deliberate choice. */
  click() {
    if (!enabled) return
    noise(0.045, 2600, 1.1, 0.05)
    tone(420, 0.06, 0.02)
  },
  /** The registration lock. One sound, one moment — the whole point. */
  lock() {
    if (!enabled) return
    noise(0.07, 1500, 0.8, 0.09)
    tone(128, 0.19, 0.075)
    tone(64, 0.26, 0.05, 'triangle')
  },
  /** Paper / plate movement under a slow reveal. */
  slide() {
    if (!enabled) return
    noise(0.34, 900, 0.5, 0.024)
  },
  /** A measurement snapping to a whole number. */
  snap() {
    if (!enabled) return
    noise(0.022, 7200, 2.2, 0.03)
  },
}
