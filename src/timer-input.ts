import { el, text } from '@zero-dependency/dom'
import { LocalStorage } from '@zero-dependency/storage'
import { addZero } from './utils.js'

type InputElement = HTMLDivElement

export class TimerInput {
  el: HTMLElement

  private seconds: InputElement
  private minutes: InputElement
  private inputClock = 0
  private currentInput: InputElement
  private store = new LocalStorage('timer', { minutes: 0, seconds: 0 })

  get currentState() {
    return {
      type: this.currentInput.dataset['type']!,
      textContent: this.currentInput.textContent!
    }
  }

  mount(): void {
    const inputs = ['minutes', 'seconds'] as const

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
        return this.currentInput.blur()
      case 'ArrowLeft':
      case 'ArrowRight':
        return this.navigateInput()
      case 'ArrowUp':
      case 'ArrowDown':
        return this.incrementInputValue(event.key === 'ArrowUp' ? 1 : -1)
    }

    if (Number.isNaN(parseInt(event.key))) return
    this.changeInputValue(event.key)
  }

  private navigateInput(): void {
    const nextInput = (this.currentInput.nextElementSibling ??
      this.currentInput.previousElementSibling) as HTMLDivElement

    this.focusInput(nextInput)
  }

  private changeInputValue(num: string): void {
    const { type, textContent } = this.currentState

    const newValue = parseInt(
      this.inputClock
        ? textContent.slice(1) + num
        : textContent.slice(0, 1) + num
    )

    switch (type) {
      case 'minutes':
        this.changeMinutesValue(newValue)
        break
      case 'seconds':
        this.changeSecondsValue(newValue)
        break
    }

    this.updateInputClock()
  }

  private incrementInputValue(num: number): void {
    const { type, textContent } = this.currentState
    const currentValue = parseInt(textContent)

    switch (type) {
      case 'minutes':
        return this.changeMinutesValue(currentValue + num)
      case 'seconds':
        return this.changeSecondsValue(currentValue + num)
    }
  }

  private changeMinutesValue(value: number): void {
    if (value < 0) value = 99
    if (value > 99) value = 0

    this.minutes.textContent = addZero(value)
    this.store.write((prevValue) => ({ ...prevValue, minutes: value }))
  }

  private changeSecondsValue(value: number): void {
    if (value < 0) value = 59
    if (value > 59) value = 0

    this.seconds.textContent = addZero(value)
    this.store.write((prevValue) => ({ ...prevValue, seconds: value }))
  }

  private updateInputClock(value?: number): void {
    this.inputClock = value ?? (this.inputClock + 1) % 2
  }

  updateInputValues(): void {
    const { minutes, seconds } = this.store.values
    this.minutes.textContent = addZero(minutes)
    this.seconds.textContent = addZero(seconds)
  }
}
