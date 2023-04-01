import { el } from '@zero-dependency/dom'
import { events } from '../libs/events.js'
import { store } from '../libs/storage.js'
import { addZero } from '../utils.js'
import type { Time } from '../libs/storage.js'

const inputs = ['minutes', 'seconds'] as const

type InputType = typeof inputs[number]
type InputElement = HTMLDivElement

export class TimerInput {
  el: HTMLElement

  private seconds: InputElement
  private minutes: InputElement
  private inputClock = 0
  private currentInput: InputElement

  get inputData() {
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
        events.emit('timer_start', store.getByKey('time'))
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
    const { type, time } = this.inputData
    const newValue = this.inputClock
      ? time.slice(1) + num
      : time.slice(0, 1) + num

    const value = this.parseTime(type, newValue)
    this.writeInputValues(type, value)
    this.updateInputClock()
  }

  private incrementInputValue(inc: number): void {
    const { type, time } = this.inputData
    const value = this.parseTime(type, time, inc)
    this.writeInputValues(type, value)
  }

  private writeInputValues(type: InputType, value: number): void {
    this[type].textContent = addZero(value)
    store.write((prevValue) => ({
      ...prevValue,
      time: { ...prevValue.time, [type]: value }
    }))
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

  updateInputValues(onTickTime?: Time): void {
    const time = store.getByKey('time')
    this.minutes.textContent = addZero(
      onTickTime ? onTickTime.minutes : time.minutes
    )
    this.seconds.textContent = addZero(
      onTickTime ? onTickTime.seconds : time.seconds
    )

    if (onTickTime) {
      store.write((prevValue) => ({ ...prevValue, onTickTime: onTickTime }))
    }
  }
}
