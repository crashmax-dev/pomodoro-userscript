import { Emitter } from '@zero-dependency/emitter'
import type { Time } from '../ui/timer-input.js'

type Events = {
  timer_start: (time: Time) => void
  timer_tick: (time: Time) => void
  timer_stop: () => void
}

export const events = new Emitter<Events>()
