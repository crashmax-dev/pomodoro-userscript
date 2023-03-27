import { el } from '@zero-dependency/dom'
import { LocalStorage } from '@zero-dependency/storage'
import { events } from './events.js'
import { addZero } from './utils.js'

const inputs = ['minutes', 'seconds'] as const

export interface Time {
  minutes: number
  seconds: number
}

type InputType = typeof inputs[number]
type InputElement = HTMLDivElement

export class TimerInput {
  el: HTMLElement

  private seconds: InputElement
  private minutes: InputElement
  private inputClock = 0
  private currentInput: InputElement
  private tempStore = new LocalStorage<Time>('temp_timer', {
    minutes: 0,
    seconds: 0
  })
  private store = new LocalStorage<Time>('timer', { minutes: 0, seconds: 0 })

  get currentState() {
    return {
      type: this.currentInput.dataset['type']! as InputType,
      time: this.currentInput.textContent!
    }
  }

  mount(): void {
    for (const inputName of inputs) {
      const input = el('div', { contentEditable: 'true' })
      input.dataset['type'] = inputName

      input.addEventListener('keydown', (event) => this.onKeyDown(event))
      input.addEventListener('click', (event) => {
        event.preventDefault()
        this.focusInput(input)
      })

      this[inputName] = input
    }

    this.updateInputValues()
    this.el = el('div', { className: 'timer' }, this.minutes, ':', this.seconds)
  }

  private focusInput(input: HTMLDivElement): void {
    this.currentInput = input
    this.currentInput.focus()
    this.updateInputClock(0)
  }

  private onKeyDown(event: KeyboardEvent): void {
    event.preventDefault()

    switch (event.key) {
      case 'Enter':
      case 'Escape':
        events.emit('timer_start', this.store.values)
        this.currentInput.blur()
        break
      case 'ArrowLeft':
      case 'ArrowRight':
        this.navigateInput()
        break
      case 'ArrowUp':
      case 'ArrowDown':
        this.incrementInputValue(event.key === 'ArrowUp' ? 1 : -1)
        break
      default:
        if (Number.isNaN(parseInt(event.key))) return
        this.changeInputValue(event.key)
    }
  }

  private navigateInput(): void {
    const nextInput = (this.currentInput.nextElementSibling ??
      this.currentInput.previousElementSibling) as HTMLDivElement

    this.focusInput(nextInput)
  }

  private changeInputValue(num: string): void {
    const { type, time } = this.currentState
    const newValue = this.inputClock
      ? time.slice(1) + num
      : time.slice(0, 1) + num

    const value = this.parseTime(type, newValue)
    this.writeInputValues(type, value)
    this.updateInputClock()
  }

  private incrementInputValue(inc: number): void {
    const { type, time } = this.currentState
    const value = this.parseTime(type, time, inc)
    this.writeInputValues(type, value)
  }

  private writeInputValues(type: InputType, value: number): void {
    this[type].textContent = addZero(value)
    this.store.write((prevValue) => ({ ...prevValue, [type]: value }))
  }

  private updateInputClock(value?: number): void {
    this.inputClock = value ?? (this.inputClock + 1) % 2
  }

  private parseTime(type: InputType, time: string, inc: number = 0): number {
    let parsedTime = parseInt(time) + inc

    switch (type) {
      case 'minutes':
        if (parsedTime < 0) parsedTime = 99
        if (parsedTime > 99) parsedTime = 0
        break
      case 'seconds':
        if (parsedTime < 0) parsedTime = 59
        if (parsedTime > 59) parsedTime = 0
        break
    }

    return parsedTime
  }

  updateInputValues(time?: Time): void {
    const storeValues = this.store.values
    this.minutes.textContent = addZero(
      time ? time.minutes : storeValues.minutes
    )
    this.seconds.textContent = addZero(
      time ? time.seconds : storeValues.seconds
    )

    if (time) {
      this.tempStore.write(time)
    }
  }
}
