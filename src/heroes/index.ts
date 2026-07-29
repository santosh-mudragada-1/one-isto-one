import type { ComponentType } from 'react'
import ActualSize from './ActualSize/ActualSize'
import Sentence from './Sentence/Sentence'
import Registration from './Registration/Registration'
import Line from './Line/Line'
import Ratio from './Ratio/Ratio'

export type Concept = {
  id: string
  num: string
  name: string
  /** The one thing this direction is remembered by. */
  signature: string
  Component: ComponentType
}

export const CONCEPTS: Concept[] = [
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
    signature: 'The colon splits the screen and always returns to centre.',
    Component: Ratio,
  },
]
