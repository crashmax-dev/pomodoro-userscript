import { Countdown } from './countdown.js'
import { Draggable } from './draggable.js'
import { TimerInput } from './timer-input.js'
import { Widget } from './widget.js'
import './style.scss'

class App {
  private readonly timer: TimerInput
  private readonly draggable: Draggable
  private readonly widget: Widget
  private readonly countdown: Countdown

  constructor() {
    this.timer = new TimerInput()
    this.draggable = new Draggable()
    this.widget = new Widget()
    this.countdown = new Countdown(
      (time) => this.timer.updateInputValues(time),
      () => {}
    )
  }

  mount() {
    this.timer.mount()
    this.widget.mount(this.draggable, this.timer)
    this.draggable.mount(this.widget.el)

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
