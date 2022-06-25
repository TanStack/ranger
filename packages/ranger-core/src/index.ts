import { linearInterpolator, getBoundingClientRect, sortNumList } from './utils'

type RangerChangeEvent<TTrackElement> =  (instance: Ranger<TTrackElement>) => void

export interface RangerOptions<TTrackElement = unknown> {
  // Required from the user
  getRangerElement: () => TTrackElement
  values: ReadonlyArray<number>

  interpolator?: {
    getPercentageForValue: (val: number, min: number, max: number) => number
    getValueForClientX: (
      clientX: number,
      trackDims: { width: number; left: number },
      min: number,
      max: number
    ) => number
  }
  tickSize?: number
  min: number
  max: number
  ticks: ReadonlyArray<number>
  steps: ReadonlyArray<number>
  stepSize: number

  onChange?: RangerChangeEvent<TTrackElement>
  onDrag?: RangerChangeEvent<TTrackElement>

  rerender: () => void
  debug?: boolean
}

export class Ranger<TTrackElement = unknown> {
  activeHandleIndex: number | undefined
  tempValues: ReadonlyArray<number> | undefined
  sortedValues: ReadonlyArray<number> = []

  options!: Required<Omit<RangerOptions<TTrackElement>, 'onDrag'>> & { onDrag?: RangerChangeEvent<TTrackElement> }

  private rangerElement: TTrackElement | null = null

  constructor(opts: RangerOptions<TTrackElement>) {
    this.setOptions(opts)
  }

  setOptions(opts: RangerOptions<TTrackElement>) {
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
      this.options.max
    )
  }

  getNextStep = (val: number, direction: number) => {
    const { steps, stepSize, min, max } = this.options

    if (steps) {
      let currIndex = steps.indexOf(val)
      let nextIndex = currIndex + direction
      if (nextIndex >= 0 && nextIndex < steps.length) {
        return steps[nextIndex]
      } else {
        return val
      }
    } else {
      if (process.env.NODE_ENV !== 'production' && this.options.debug) {
        if (typeof stepSize === 'undefined') {
          throw new Error(
            'Warning: The option `stepSize` is expected in `useRanger`, but its value is `undefined`'
          )
        }
      }
      let nextVal = val + stepSize * direction
      if (nextVal >= min && nextVal <= max) {
        return nextVal
      } else {
        return val
      }
    }
  }

  roundToStep = (val: number) => {
    const { steps, stepSize, min, max } = this.options

    let left = min
    let right = max
    if (steps) {
      steps.forEach(step => {
        if (step <= val && step > left) {
          left = step
        }
        if (step >= val && step < right) {
          right = step
        }
      })
    } else {
      if (process.env.NODE_ENV !== 'production' && this.options.debug) {
        if (typeof stepSize === 'undefined') {
          throw new Error(
            'Warning: The option `stepSize` is expected in `useRanger`, but its value is `undefined`'
          )
        }
      }
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
      const newValue = this.getNextStep(values[i], direction)
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

  handlePress = (e: any, i: number) => {
    this.activeHandleIndex = i

    const handleRelease = (e: MouseEvent | TouchEvent) => {
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
      this.options.rerender();
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
      this.options.max
    )

  getTicks = () => {
    let ticks: Array<number> = [...this.options.ticks] || [
      ...this.options.steps,
    ]

    if (!ticks) {
      ticks = [this.options.min]
      while (
        ticks[ticks.length - 1] <
        this.options.max - this.options.tickSize
      ) {
        ticks.push(ticks[ticks.length - 1] + this.options.tickSize)
      }
      ticks.push(this.options.max)
    }

    return ticks.map((value, i) => ({
      value,
      getTickProps: ({ key = i, ...rest } = {}) => ({
        key,
        percentage: this.getPercentageForValue(value),
        ...rest,
      }),
    }))
  }

  getSegments = () => {
    const sortedValues = sortNumList(this.tempValues || this.options.values)

    return [...sortedValues, this.options.max].map((value, i) => ({
      value,
      getSegmentProps: ({ key = i, ...rest } = {}) => {
        const left = this.getPercentageForValue(
          sortedValues[i - 1] ? sortedValues[i - 1] : this.options.min
        )
        const width = this.getPercentageForValue(value) - left
        return {
          key,
          left,
          width,
          ...rest,
        }
      },
    }))
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
