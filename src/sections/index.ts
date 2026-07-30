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
        status: 'final',
        scrolls: true,
        Component: SecondLine,
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
