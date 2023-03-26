import { el } from '@zero-dependency/dom'
import { Draggable } from './draggable.js'
import { TimerInput } from './timer-input.js'

export class Widget {
  el: HTMLDivElement

  private container: HTMLDivElement
  private draggable: Draggable
  private timer: TimerInput

  mount(draggable: Draggable, timer: TimerInput): void {
    this.timer = timer
    this.draggable = draggable

    this.container = el('div', { className: 'widget-container' }, this.timer.el)

    this.el = el(
      'div',
      {
        className: 'widget',
        onmouseenter: () => {
          this.draggable.el.classList.add('moved')
        },
        onmouseleave: () => {
          this.draggable.el.classList.remove('moved')
        },
        onauxclick: (event: Event) => {
          event.preventDefault()
        },
        oncontextmenu: (event: Event) => {
          event.preventDefault()
        }
      },
      this.container
    )
  }
}
