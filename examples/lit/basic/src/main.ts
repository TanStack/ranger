import {
  html,
  LitElement,
} from 'lit'

import { customElement, state } from 'lit/decorators.js'
import { Ranger, RangerConfig, RangerOptions } from '@tanstack/ranger'
import { createRef, ref } from 'lit/directives/ref.js'


@customElement('ranger-example')
class RangerExample extends LitElement {
  private rangerRef = createRef<HTMLDivElement>()

  @state()
  private _values: number[] = [0, 15, 50]

  private rangerController = new RangerController(this)

  protected render() {
    const rangerInstance = this.rangerController.getRanger({
      getRangerElement: () => {
        return this.rangerRef.value
      },
      values: this._values,
      min: 0,
      max: 100,
      stepSize: 5,
      onChange: (instance: Ranger) => {
        this._values = [...instance.sortedValues]
      },
    })
    return html`
      <div class="App" style="padding: 10px">
        <h1>Basic Range</h1>
        <span>Active Index: ${rangerInstance.activeHandleIndex}</span>
        <div ${ref(this.rangerRef)} class="ranger-element">
          ${rangerInstance
            .handles()
            .map(
              ({
                value,
                onTouchStart,
                onMouseDownHandler,
                onKeyDownHandler,
                isActive,
              }) => html` <button
                @keydown="${onKeyDownHandler}"
                @mousedown=${onMouseDownHandler}
                @touchstart="${onTouchStart}"
                role="slider"
                class="ranger-button"
                aria-valuemin="${rangerInstance.options.min}"
                aria-valuemax="${rangerInstance.options.max}"
                aria-valuenow="${value}"
                style="left: ${rangerInstance.getPercentageForValue(
                  value,
                )}%;z-index: ${isActive ? '1' : '0'}"
              ></button>`,
            )}
        </div>
        <br />
        <br />
        <br />
        <pre style="display: inline-block; text-align: left">
        <code>
          _values: ${JSON.stringify(this._values)}
        </code>
        </pre>
      </div>
      <style>
        .ranger-element {
          position: relative;
          user-select: none;
          height: 4px;
          background: #ddd;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
        }

        .ranger-button {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          outline: none;
          border-radius: 100%;
          background: linear-gradient(to bottom, #eee 45%, #ddd 55%);
          border: solid 1px #888;
        }
      </style>
    `
  }
}
