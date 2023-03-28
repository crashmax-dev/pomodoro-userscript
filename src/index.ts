import { Countdown } from './features/countdown.js'
import { events } from './libs/events.js'
import { DraggableOverlay } from './ui/draggable-overlay.js'
import { TimerInput } from './ui/timer-input.js'
import { Widget } from './ui/widget.js'
import './styles/global.scss'
import { StorageData, store } from './libs/storage.js'

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
      store.write((prevData) => ({ ...prevData, isRunning: true }))
    })

    events.on('timer_stop', () => {
      this.countdown.stop()
      store.write((prevData) => ({ ...prevData, isRunning: true }))
    })

    events.on('timer_tick', (time) => {
      this.timer.updateInputValues(time)
    })

    window.addEventListener('storage', (event) => {
      const prevStorageData = JSON.parse(event.oldValue!) as StorageData
      const newStorageData = JSON.parse(event.newValue!) as StorageData
      if (!prevStorageData.isRunning && newStorageData.isRunning) {
        events.emit('timer_start', newStorageData.time)
      }

      if (prevStorageData.isRunning && !newStorageData.isRunning) {
        events.emit('timer_stop')
      }

      if (event.key === 'pomodoro-store') {
        this.draggable.updatePosition()
        this.timer.updateInputValues()
      }
    })
  }
}

const app = new App()
app.mount()
