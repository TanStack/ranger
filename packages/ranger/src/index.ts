import { linearInterpolator, getBoundingClientRect, sortNumList } from './utils'

export type RangerChangeEvent<TTrackElement> = (
  instance: Ranger<TTrackElement>,
) => void

export type RangerInterpolator = {
  getPercentageForValue: (val: number, min: number, max: number) => number
  getValueForClientX: (
    clientX: number,
    trackDims: { width: number; left: number },
    min: number,
    max: number,
  ) => number
}

export type RangerClassConfig<TTrackElement = unknown> = {
  getRangerElement: () => TTrackElement | null
  values: ReadonlyArray<number>

  min: number
  max: number

  tickSize: number
  ticks?: ReadonlyArray<number>

  interpolator: RangerInterpolator
  onChange: RangerChangeEvent<TTrackElement>
  onDrag?: RangerChangeEvent<TTrackElement>

  rerender: () => void
  debug: boolean
} & ({ stepSize: number } | { steps: ReadonlyArray<number> })

export type RangerConfig<TTrackElement = unknown> = Omit<
  RangerClassConfig<TTrackElement>,
  'tickSize' | 'interpolator' | 'onChange' | 'debug'
> & {
  tickSize?: number
  interpolator?: RangerInterpolator
  onChange?: RangerChangeEvent<TTrackElement>
  debug?: boolean
} & ({ stepSize: number } | { steps: ReadonlyArray<number> })

export type RangerOptions<TTrackElement = unknown> = Omit<
  RangerConfig<TTrackElement>,
  'rerender'
> &
  ({ stepSize: number } | { steps: ReadonlyArray<number> })

export class Ranger<TTrackElement = unknown> {
  activeHandleIndex: number | undefined
  tempValues: ReadonlyArray<number> | undefined
  sortedValues: ReadonlyArray<number> = []

  options!: RangerClassConfig<TTrackElement>

  private rangerElement: TTrackElement | null = null

  constructor(opts: RangerConfig<TTrackElement>) {
    this.setOptions(opts)
  }

  setOptions(opts: RangerConfig<TTrackElement>) {
    Object.entries(opts).forEach(([key, value]) => {
      if (typeof value === 'undefined') delete (opts as any)[key]
    })

    this.options = {
      debug: false,
      tickSize: 10,
      interpolator: linearInterpolator,
      onChange: () => {},
      ...opts,
    }
  }

  _willUpdate = () => {
    const rangerElement = this.options.getRangerElement()

    if (this.rangerElement !== rangerElement) {
      this.rangerElement = rangerElement
    }
  }

  getValueForClientX = (clientX: number) => {
    const trackDims = getBoundingClientRect(this.rangerElement)
    return this.options.interpolator.getValueForClientX(
      clientX,
      trackDims,
      this.options.min,
      this.options.max,
    )
  }

  getNextStep = (val: number, direction: number): number => {
    const { min, max } = this.options

    if ('steps' in this.options) {
      const { steps } = this.options
      let currIndex = steps.indexOf(val)
      let nextIndex = currIndex + direction
      if (nextIndex >= 0 && nextIndex < steps.length) {
        return steps[nextIndex] as number
      } else {
        return val
      }
    } else {
      let nextVal = val + this.options.stepSize * direction
      if (nextVal >= min && nextVal <= max) {
        return nextVal
      } else {
        return val
      }
    }
  }

  roundToStep = (val: number) => {
    const { min, max } = this.options

    let left = min
    let right = max
    if ('steps' in this.options) {
      this.options.steps.forEach((step) => {
        if (step <= val && step > left) {
          left = step
        }
        if (step >= val && step < right) {
          right = step
        }
      })
    } else {
      const { stepSize } = this.options
      while (left < val && left + stepSize < val) {
        left += stepSize
      }

      right = Math.min(left + stepSize, max)
    }

    if (val - left < right - val) {
      return left
    }
    return right
  }

  handleDrag = (e: any) => {
    if (this.activeHandleIndex === undefined) {
      return
    }

    const clientX =
      e.type === 'touchmove' ? e.changedTouches[0].clientX : e.clientX
    const newValue = this.getValueForClientX(clientX)
    const newRoundedValue = this.roundToStep(newValue)

    this.sortedValues = [
      ...this.options.values.slice(0, this.activeHandleIndex),
      newRoundedValue,
      ...this.options.values.slice(this.activeHandleIndex + 1),
    ]

    if (this.options.onDrag) {
      this.options.onDrag(this)
    } else {
      this.tempValues = this.sortedValues
      this.options.rerender()
    }
  }

  handleKeyDown = (e: KeyboardEvent, i: number) => {
    const { values } = this.options

    // Left Arrow || Right Arrow
    if (e.keyCode === 37 || e.keyCode === 39) {
      this.activeHandleIndex = i
      const direction = e.keyCode === 37 ? -1 : 1
      const newValue = this.getNextStep(values[i] as number, direction)
      const newValues = [
        ...values.slice(0, i),
        newValue,
        ...values.slice(i + 1),
      ]
      this.sortedValues = sortNumList(newValues)
      if (this.options.onChange) {
        this.options.onChange(this)
      }
    }
  }

  handlePress = (_e: any, i: number) => {
    this.activeHandleIndex = i
    this.options.rerender()

    const handleRelease = () => {
      const { tempValues, handleDrag } = this

      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('touchmove', handleDrag)
      document.removeEventListener('mouseup', handleRelease)
      document.removeEventListener('touchend', handleRelease)
      this.sortedValues = sortNumList(tempValues || this.options.values)
      if (this.options.onChange) {
        this.options.onChange(this)
      }
      if (this.options.onDrag) {
        this.options.onDrag(this)
      }
      this.activeHandleIndex = undefined
      this.tempValues = undefined
      this.options.rerender()
    }
    const { handleDrag } = this
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('touchmove', handleDrag)
    document.addEventListener('mouseup', handleRelease)
    document.addEventListener('touchend', handleRelease)
  }

  getPercentageForValue = (val: number) =>
    this.options.interpolator.getPercentageForValue(
      val,
      this.options.min,
      this.options.max,
    )

  getTicks = () => {
    let ticks: Array<number> = []
    if (this.options.ticks) {
      ticks = [...this.options.ticks]
    } else if ('steps' in this.options) {
      ticks = [...this.options.steps]
    } else {
      ticks = [this.options.min]
      while (
        (ticks[ticks.length - 1] as number) <
        this.options.max - this.options.tickSize
      ) {
        ticks.push((ticks[ticks.length - 1] as number) + this.options.tickSize)
      }
      ticks.push(this.options.max)
    }

    return ticks.map((value, i) => ({
      value,
      key: i,
      percentage: this.getPercentageForValue(value),
    }))
  }

  getSteps = () => {
    const values = sortNumList(this.tempValues || this.options.values)

    return [...values, this.options.max].map((value, i) => {
      const previousValue = values[i - 1]
      const leftValue =
        previousValue !== undefined ? previousValue : this.options.min
      const left = this.getPercentageForValue(leftValue)
      const width = this.getPercentageForValue(value) - left
      return {
        left,
        width,
      }
    })
  }

  handles = () => {
    return (this.tempValues || this.options.values).map((value, i) => ({
      value,
      isActive: i === this.activeHandleIndex,
      onKeyDownHandler: (e: any) => {
        this.handleKeyDown(e, i)
      },
      onMouseDownHandler: (e: any) => {
        this.handlePress(e, i)
      },
      onTouchStart: (e: any) => {
        this.handlePress(e, i)
      },
    }))
  }
}
