import type { ComponentType } from 'react'

import ActualSize from './hero/ActualSize/ActualSize'
import Line from './hero/Line/Line'
import Ratio from './hero/Ratio/Ratio'

import Calendars from './problem/Calendars/Calendars'
import Relay from './problem/Relay/Relay'
import Rewrite from './problem/Rewrite/Rewrite'
import SignOff from './problem/SignOff/SignOff'
import Seams from './problem/Seams/Seams'

import SecondLine from './answer/SecondLine/SecondLine'
import FocusList from './answer/FocusList/FocusList'

import Notebook from './thinking/Notebook/Notebook'
import Questions from './thinking/Questions/Questions'

import OneDay from './studio/OneDay/OneDay'
import Mobile from './studio/Mobile/Mobile'

import Apart from './close/Apart/Apart'

/** `final` ships. `reference` is kept deliberately, not left behind. */
export type Status = 'final' | 'reference'

export type Version = {
  id: string
  /** Kept stable across deletions — these are the numbers we talk in. */
  num: string
  name: string
  /** The one thing this direction is remembered by. */
  signature: string
  status?: Status
  /** True when the version drives itself from page scroll rather than
   *  playing out inside a single viewport. */
  scrolls?: boolean
  Component: ComponentType
}

export type Section = {
  id: string
  num: string
  name: string
  /** What this section has to make the visitor feel. */
  intent: string
  versions: Version[]
}

export const SECTIONS: Section[] = [
  {
    id: 'hero',
    num: '01',
    name: 'Hero',
    intent: 'Businesses are experienced as one, yet built in pieces.',
    versions: [
      {
        id: 'actual-size',
        num: '01',
        name: 'Actual Size',
        signature: 'The page measures itself.',
        status: 'reference',
        Component: ActualSize,
      },
      {
        id: 'line',
        num: '04',
        name: 'The Unbroken Line',
        signature: 'One stroke that never lifts.',
        status: 'final',
        Component: Line,
      },
      {
        id: 'ratio',
        num: '05',
        name: 'The Living Ratio',
        signature: 'The colon splits the screen and always returns to 1:1.',
        status: 'reference',
        Component: Ratio,
      },
    ],
  },
  {
    id: 'problem',
    num: '02',
    name: 'The Problem',
    intent: 'Everyone did their job. So whose job was the part that went wrong?',
    versions: [
      {
        id: 'calendars',
        num: '01',
        name: 'Six Calendars',
        signature: 'Drag one customer through two years of separate decisions.',
        status: 'reference',
        scrolls: true,
        Component: Calendars,
      },
      {
        id: 'relay',
        num: '02',
        name: 'The Relay',
        signature: 'Quality goes up and coherence drains, in the same motion.',
        status: 'reference',
        scrolls: true,
        Component: Relay,
      },
      {
        id: 'rewrite',
        num: '03',
        name: 'The Rewrite',
        signature: 'Six defensible edits and the sentence means something else.',
        status: 'reference',
        scrolls: true,
        Component: Rewrite,
      },
      {
        id: 'sign-off',
        num: '04',
        name: 'The Sign-Off Sheet',
        signature: 'The row nobody signed — and you are not allowed to sign it.',
        status: 'reference',
        scrolls: true,
        Component: SignOff,
      },
      {
        id: 'seams',
        num: '05',
        name: 'The Seams',
        signature:
          'The joins stay visible after the pieces close — and the line crosses every one.',
        status: 'final',
        scrolls: true,
        Component: Seams,
      },
    ],
  },
  {
    id: 'answer',
    num: '03',
    name: 'What We Do',
    intent: 'We finally found someone who sees the whole picture.',
    versions: [
      {
        id: 'second-line',
        num: '01',
        name: 'The Second Line',
        signature:
          'A second stroke arrives, matches pace, and never leaves — the five are where they are tied together.',
        status: 'reference',
        scrolls: true,
        Component: SecondLine,
      },
      {
        id: 'focus-list',
        num: '02',
        name: 'The Focus List',
        signature:
          'Focus travels the five; whatever is in focus scales up and opens a gap in its own name.',
        status: 'final',
        scrolls: true,
        Component: FocusList,
      },
    ],
  },
  {
    id: 'thinking',
    num: '04',
    name: 'How We Think',
    intent: 'They would have asked me things nobody asked me.',
    versions: [
      {
        id: 'notebook',
        num: '01',
        name: 'The Notebook',
        signature:
          'Dated entries including one they stopped believing and one that stops mid-sentence.',
        status: 'reference',
        scrolls: true,
        Component: Notebook,
      },
      {
        id: 'questions',
        num: '02',
        name: 'The Questions',
        signature:
          'Five questions nobody else asks, each with an answer line that is never filled in.',
        status: 'final',
        scrolls: true,
        Component: Questions,
      },
    ],
  },
  {
    id: 'studio',
    num: '05',
    name: 'The Studio',
    intent: 'One team holds the whole day, and I know who to call.',
    versions: [
      {
        id: 'one-day',
        num: '01',
        name: 'One Day',
        signature:
          'The day travels sideways along the spine, and the same name sits under all six hours of it.',
        status: 'reference',
        scrolls: true,
        Component: OneDay,
      },
      {
        id: 'mobile',
        num: '02',
        name: 'Move One',
        signature:
          'The heading rides a line that bends with scroll speed; the six cross the screen on the spine, one at a time.',
        status: 'final',
        scrolls: true,
        Component: Mobile,
      },
    ],
  },
  {
    id: 'close',
    num: '06',
    name: 'Start a Conversation',
    intent: 'I already know what I would say. I can send that in one line.',
    versions: [
      {
        id: 'apart',
        num: '01',
        name: 'Where It Comes Apart',
        signature: 'The line stops — on a 9px square, for the only time on the site.',
        status: 'final',
        scrolls: true,
        Component: Apart,
      },
    ],
  },
]

/** Where the deck opens: the chosen direction, not the first row. */
export const defaultPosition = () => {
  for (let s = 0; s < SECTIONS.length; s++) {
    const v = SECTIONS[s].versions.findIndex((x) => x.status === 'final')
    if (v >= 0) return { section: s, version: v }
  }
  return { section: 0, version: 0 }
}
