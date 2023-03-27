import { clearInterval, setInterval } from 'worker-timers'
import type { Time } from './timer-input.js'

export class Countdown {
  private interval: number
  private minutes: number
  private seconds: number

  constructor(
    private readonly onTick: (time: Time) => void,
    private readonly onStop: () => void
  ) {}

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
  }

  private tick(): void {
    this.seconds--

    if (this.minutes > 0 && this.seconds < 0) {
      this.seconds = 59
      this.minutes--
    }

    if (this.minutes === 0 && this.seconds === 0) {
      this.onStop()
    }

    this.onTick({ minutes: this.minutes, seconds: this.seconds })
  }
}
