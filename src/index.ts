import { Countdown } from './features/countdown.js'
import { events } from './libs/events.js'
import { DraggableOverlay } from './ui/draggable-overlay.js'
import { TimerInput } from './ui/timer-input.js'
import { Widget } from './ui/widget.js'
import './styles/global.scss'

class App {
  private readonly timer: TimerInput
  private readonly draggable: DraggableOverlay
  private readonly widget: Widget
  private readonly countdown: Countdown

  constructor() {
    this.timer = new TimerInput()
    this.draggable = new DraggableOverlay()
    this.widget = new Widget()
    this.countdown = new Countdown()
  }

  mount() {
    this.timer.mount()
    this.widget.mount(this.draggable, this.timer)
    this.draggable.mount(this.widget.el)

    events.on('timer_start', (time) => {
      this.countdown.setTime(time)
      this.countdown.start()
    })

    events.on('timer_stop', () => {
      this.countdown.stop()
    })

    events.on('timer_tick', (time) => {
      this.timer.updateInputValues(time)
    })

    window.addEventListener('storage', (event) => {
      switch (event.key) {
        case 'position':
          return this.draggable.updatePosition()
        case 'timer':
          return this.timer.updateInputValues()
      }
    })
  }
}

const app = new App()
app.mount()
