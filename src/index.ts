import { Draggable } from './draggable.js'
import { TimerInput } from './timer-input.js'
import { Widget } from './widget.js'
import './style.scss'

class App {
  private readonly timer = new TimerInput()
  private readonly draggable = new Draggable()
  private readonly widget = new Widget()

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
