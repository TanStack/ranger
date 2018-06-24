import React from 'react'
import PropTypes from 'prop-types'

const getBoundingClientRect = element => {
  const rect = element.getBoundingClientRect()
  return {
    left: Math.ceil(rect.left),
    width: Math.ceil(rect.width),
  }
}

class ReactRanger extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,
    stepSize: PropTypes.number,
    tickSize: PropTypes.number,
    steps: PropTypes.arrayOf(PropTypes.number),
    ticks: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func,
    onTrackClick: PropTypes.func,
    onPress: PropTypes.func,
    onDrag: PropTypes.func,
    onRelease: PropTypes.func,
  }
  static defaultProps = {
    tickSize: 10,
  }
  state = {
    activeHandleIndex: null,
  }
  handleEls = []
  handleDimensions = []
  onPress = (e, activeHandleIndex) => {
    this.setState({
      activeHandleIndex,
    })
    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('touchmove', this.onDrag)
    document.addEventListener('mouseup', this.onRelease)
    document.addEventListener('touchend', this.onRelease)
    if (this.props.onPress) {
      this.props.onPress(e)
    }
  }
  onDrag = e => {
    const { onChange, onDrag } = this.props
    const { activeHandleIndex } = this.state
    const values = this.getValues()

    const newValue = this.getValueForClientX(e.clientX)
    const newRoundedValue = this.roundToStep(newValue)

    const newValues = [
      ...values.slice(0, activeHandleIndex),
      newRoundedValue,
      ...values.slice(activeHandleIndex + 1),
    ]

    // This is some code that attempts to allow the handles
    // to reorder themselves based on the sorted values. It's buggy.
    // but worth keeping around.
    //
    // let newActiveHandleIndex = activeHandleIndex
    //
    // if (typeof this.lastValue !== "undefined" && this.lastValue !== newValue) {
    //   const prevVal = values[activeHandleIndex - 1]
    //     ? values[activeHandleIndex - 1]
    //     : min
    //   const nextVal = values[activeHandleIndex + 1]
    //     ? values[activeHandleIndex + 1]
    //     : max

    //   console.log(this.lastValue, newValue)

    //   if (newValue < this.lastValue && newValue <= prevVal) {
    //     newActiveHandleIndex = Math.max(activeHandleIndex - 1, 0)
    //   } else if (newValue > this.lastValue && newValue >= nextVal) {
    //     newActiveHandleIndex = Math.min(
    //       activeHandleIndex + 1,
    //       values.length - 1
    //     )
    //   }
    // }

    // this.lastValue = newValue

    if (onDrag) {
      onDrag(e)
    }
    onChange(newValues)
  }
  onRelease = e => {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('mouseup', this.onRelease)
    document.removeEventListener('touchend', this.onRelease)
    this.setState(
      {
        activeHandleIndex: null,
      },
      () => {
        if (this.props.onRelease) {
          this.props.onRelease(e)
        }
      }
    )
  }
  roundToStep = val => {
    const {
      min, max, steps, stepSize,
    } = this.props

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
      if (typeof stepSize === 'undefined') {
        throw new Error(
          'Warning: Failed prop type: The prop `stepSize` is expected in `ReactRanger`, but its value is `undefined`'
        )
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
  getValues = () => (Array.isArray(this.props.value) ? this.props.value : [this.props.value])
  getPercentageForValue = val => {
    const { min, max } = this.props
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
  }
  getValueForClientX = clientX => {
    const { min, max } = this.props
    const trackDims = getBoundingClientRect(this.trackEl)
    const percentageValue = (clientX - trackDims.left) / trackDims.width
    const value = (max - min) * percentageValue
    return value + min
  }
  getTicks = () => {
    const {
      min, max, tickSize, ticks: controlledTicks, steps: controlledSteps,
    } = this.props
    // Build the ticks
    let ticks = controlledTicks
    if (!ticks) {
      if (controlledSteps) {
        ticks = controlledSteps
      } else {
        ticks = [min]
        while (ticks[ticks.length - 1] < max - tickSize) {
          ticks.push(ticks[ticks.length - 1] + tickSize)
        }
        ticks.push(max)
      }
    }
    return ticks.map((value, i) => ({
      value,
      getTickProps: ({ key, style = {} } = {}) => ({
        key: typeof key !== 'undefined' ? key : i,
        style: {
          ...style,
          position: 'absolute',
          left: `${this.getPercentageForValue(value)}%`,
        },
      }),
    }))
  }
  getSegments = () => {
    const { min, max } = this.props
    const values = this.getValues()
    const sortedValues = [...values].sort((a, b) => a - b)

    return [...sortedValues, max].map((value, i) => ({
      value,
      getSegmentProps: ({ key, style = {} } = {}) => {
        const left = this.getPercentageForValue(sortedValues[i - 1] ? sortedValues[i - 1] : min)
        const width = this.getPercentageForValue(value) - left
        return {
          key: typeof key !== 'undefined' ? key : i,
          style: {
            ...style,
            position: 'absolute',
            left: `${left}%`,
            width: `${width}%`,
          },
        }
      },
    }))
  }
  getHandles = () => {
    const { activeHandleIndex } = this.state
    const values = this.getValues()

    return values.map((value, i) => ({
      value,
      active: i === activeHandleIndex,
      getHandleProps: ({
        key,
        refProp = 'ref',
        innerRef = () => {},
        onMouseDown = () => {},
        onTouchStart = () => {},
        style = {},
        ...rest
      } = {}) => ({
        key: typeof key !== 'undefined' ? key : i,
        [refProp]: el => {
          this.handleEls[i] = el
          innerRef(el)
        },
        onMouseDown: e => {
          e.persist()
          this.onPress(e, i)
          onMouseDown(e)
        },
        onTouchStart: e => {
          e.persist()
          this.onPress(e, i)
          onTouchStart(e)
        },
        tabIndex: 1,
        style: {
          ...style,
          outline: 0,
          position: 'absolute',
          top: '50%',
          left: `${this.getPercentageForValue(value)}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: i === activeHandleIndex ? '1' : '0',
        },
        ...rest,
      }),
    }))
  }
  getTrackProps = ({ style = {}, refProp = 'ref' } = {}) => {
    const { onTrackClick } = this.props
    const { activeHandleIndex } = this.state
    return {
      [refProp]: el => {
        this.trackEl = el
      },
      onClick: e => {
        e.persist()
        if (
          activeHandleIndex !== null ||
          !onTrackClick ||
          this.handleEls.find(d => d.contains(e.target))
        ) {
          return
        }
        const value = this.getValueForClientX(e.clientX)
        onTrackClick(this.roundToStep(value), value)
      },
      style: {
        ...style,
        position: 'relative',
        userSelect: 'none',
      },
    }
  }
  render () {
    const { children } = this.props
    const { activeHandleIndex } = this.state

    const { getTrackProps } = this
    const ticks = this.getTicks()
    const segments = this.getSegments()
    const handles = this.getHandles()

    return children({
      getTrackProps,
      ticks,
      segments,
      handles,
      activeHandleIndex,
    })
  }
}

export default ReactRanger
