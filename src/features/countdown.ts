import { clearInterval, setInterval } from 'worker-timers'
import { events } from '../libs/events.js'
import type { Time } from '../libs/storage.js'

export class Countdown {
  private interval: number | null
  private minutes: number
  private seconds: number

  setTime({ minutes, seconds }: Time): void {
    this.minutes = minutes
    this.seconds = seconds
  }

  start(): void {
    this.stop()
    this.interval = setInterval(() => this.tick(), 1000)
  }

  stop(): void {
    if (!this.interval) return
    clearInterval(this.interval)
    this.interval = null
  }

  private tick(): void {
    this.seconds--

    if (this.minutes > 0 && this.seconds < 0) {
      this.seconds = 59
      this.minutes--
    }

    if (this.minutes === 0 && this.seconds === 0) {
      events.emit('timer_stop')
    }

    events.emit('timer_tick', { minutes: this.minutes, seconds: this.seconds })
  }
}
