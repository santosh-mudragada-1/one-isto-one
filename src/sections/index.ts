import type { ComponentType } from 'react'

import ActualSize from './hero/ActualSize/ActualSize'
import Sentence from './hero/Sentence/Sentence'
import Registration from './hero/Registration/Registration'
import Line from './hero/Line/Line'
import Ratio from './hero/Ratio/Ratio'

import Calendars from './problem/Calendars/Calendars'
import Relay from './problem/Relay/Relay'
import Rewrite from './problem/Rewrite/Rewrite'
import SignOff from './problem/SignOff/SignOff'
import Seams from './problem/Seams/Seams'

export type Version = {
  id: string
  num: string
  name: string
  /** The one thing this direction is remembered by. */
  signature: string
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
        Component: ActualSize,
      },
      {
        id: 'sentence',
        num: '02',
        name: 'The Sentence',
        signature: 'The sentence is pushed along by its own changing word.',
        Component: Sentence,
      },
      {
        id: 'registration',
        num: '03',
        name: 'Registration',
        signature: 'Two impressions lock into register.',
        Component: Registration,
      },
      {
        id: 'line',
        num: '04',
        name: 'The Unbroken Line',
        signature: 'One stroke that never lifts.',
        Component: Line,
      },
      {
        id: 'ratio',
        num: '05',
        name: 'The Living Ratio',
        signature: 'The colon splits the screen and always returns to 1:1.',
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
        scrolls: true,
        Component: Calendars,
      },
      {
        id: 'relay',
        num: '02',
        name: 'The Relay',
        signature: 'Quality goes up and coherence drains, in the same motion.',
        scrolls: true,
        Component: Relay,
      },
      {
        id: 'rewrite',
        num: '03',
        name: 'The Rewrite',
        signature: 'Six defensible edits and the sentence means something else.',
        scrolls: true,
        Component: Rewrite,
      },
      {
        id: 'sign-off',
        num: '04',
        name: 'The Sign-Off Sheet',
        signature: 'The row nobody signed — and you are not allowed to sign it.',
        scrolls: true,
        Component: SignOff,
      },
      {
        id: 'seams',
        num: '05',
        name: 'The Seams',
        signature: 'The joins stay visible after the pieces close.',
        scrolls: true,
        Component: Seams,
      },
    ],
  },
]
