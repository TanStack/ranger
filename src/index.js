import React from 'react'

const getBoundingClientRect = element => {
  const rect = element.getBoundingClientRect()
  return {
    left: Math.ceil(rect.left),
    width: Math.ceil(rect.width),
  }
}

const sortNumList = arr => [...arr].sort((a, b) => Number(a) - Number(b))

const useGetLatest = val => {
  const ref = React.useRef(val)
  ref.current = val
  return React.useCallback(() => ref.current, [])
}

const linearInterpolator = {
  getPercentageForValue: (val, min, max) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
  },
  getValueForClientX: (clientX, trackDims, min, max) => {
    const { left, width } = trackDims
    const percentageValue = (clientX - left) / width
    const value = (max - min) * percentageValue
    return value + min
  },
}

export function useRanger({
  interpolator = linearInterpolator,
  tickSize = 10,
  values,
  min,
  max,
  ticks: controlledTicks,
  steps,
  onChange,
  onDrag,
  stepSize,
}) {
  const [activeHandleIndex, setActiveHandleIndex] = React.useState(null)
  const [tempValues, setTempValues] = React.useState()

  const getLatest = useGetLatest({
    activeHandleIndex,
    onChange,
    onDrag,
    values,
    tempValues,
  })

  const trackElRef = React.useRef()

  const getValueForClientX = React.useCallback(
    clientX => {
      const trackDims = getBoundingClientRect(trackElRef.current)
      return interpolator.getValueForClientX(clientX, trackDims, min, max)
    },
    [interpolator, max, min]
  )

  const roundToStep = React.useCallback(
    val => {
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
        if (process.env.NODE_ENV !== 'production') {
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
    },
    [max, min, stepSize, steps]
  )

  const handleDrag = React.useCallback(
    e => {
      const { activeHandleIndex, onDrag } = getLatest()
      const clientX =
        e.type === 'touchmove' ? e.changedTouches[0].clientX : e.clientX
      const newValue = getValueForClientX(clientX)
      const newRoundedValue = roundToStep(newValue)

      const newValues = [
        ...values.slice(0, activeHandleIndex),
        newRoundedValue,
        ...values.slice(activeHandleIndex + 1),
      ]

      if (onDrag) {
        onDrag(newValues)
      } else {
        setTempValues(newValues)
      }
    },
    [getLatest, getValueForClientX, roundToStep, values]
  )

  const handlePress = React.useCallback(
    (e, i) => {
      setActiveHandleIndex(i)

      const handleRelease = e => {
        const {
          tempValues,
          values,
          onChange = () => {},
          onDrag = () => {},
        } = getLatest()

        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('touchmove', handleDrag)
        document.removeEventListener('mouseup', handleRelease)
        document.removeEventListener('touchend', handleRelease)
        const sortedValues = sortNumList(tempValues || values)
        onChange(sortedValues)
        onDrag(sortedValues)
        setActiveHandleIndex(null)
        setTempValues()
      }

      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('touchmove', handleDrag)
      document.addEventListener('mouseup', handleRelease)
      document.addEventListener('touchend', handleRelease)
    },
    [getLatest, handleDrag]
  )

  const getPercentageForValue = React.useCallback(
    val => interpolator.getPercentageForValue(val, min, max),
    [interpolator, max, min]
  )

  // Build the ticks
  const ticks = React.useMemo(() => {
    let ticks = controlledTicks || steps

    if (!ticks) {
      ticks = [min]
      while (ticks[ticks.length - 1] < max - tickSize) {
        ticks.push(ticks[ticks.length - 1] + tickSize)
      }
      ticks.push(max)
    }

    return ticks.map((value, i) => ({
      value,
      getTickProps: ({ key = i, style = {}, ...rest } = {}) => ({
        key,
        style: {
          position: 'absolute',
          width: 0,
          left: `${getPercentageForValue(value)}%`,
          transform: `translateX(-50%)`,
          ...style,
        },
        ...rest,
      }),
    }))
  }, [controlledTicks, getPercentageForValue, max, min, steps, tickSize])

  const segments = React.useMemo(() => {
    const sortedValues = sortNumList(tempValues || values)

    return [...sortedValues, max].map((value, i) => ({
      value,
      getSegmentProps: ({ key = i, style = {}, ...rest } = {}) => {
        const left = getPercentageForValue(
          sortedValues[i - 1] ? sortedValues[i - 1] : min
        )
        const width = getPercentageForValue(value) - left
        return {
          key,
          style: {
            position: 'absolute',
            left: `${left}%`,
            width: `${width}%`,
            ...style,
          },
          ...rest,
        }
      },
    }))
  }, [getPercentageForValue, max, min, tempValues, values])

  const handles = React.useMemo(
    () =>
      (tempValues || values).map((value, i) => ({
        value,
        active: i === activeHandleIndex,
        getHandleProps: ({
          key = i,
          ref,
          innerRef = () => {},
          onMouseDown,
          onTouchStart,
          style = {},
          ...rest
        } = {}) => ({
          key,
          onMouseDown: e => {
            e.persist()
            handlePress(e, i)
            if (onMouseDown) onMouseDown(e)
          },
          onTouchStart: e => {
            e.persist()
            handlePress(e, i)
            if (onTouchStart) onTouchStart(e)
          },
          role: 'slider',
          'aria-valuemin': min,
          'aria-valuemax': max,
          'aria-valuenow': value,
          style: {
            position: 'absolute',
            top: '50%',
            left: `${getPercentageForValue(value)}%`,
            zIndex: i === activeHandleIndex ? '1' : '0',
            transform: 'translate(-50%, -50%)',
            ...style,
          },
          ...rest,
        }),
      })),
    [
      activeHandleIndex,
      getPercentageForValue,
      handlePress,
      min,
      max,
      tempValues,
      values,
    ]
  )

  const getTrackProps = ({ style = {}, ref, ...rest } = {}) => {
    return {
      ref: el => {
        trackElRef.current = el
        if (ref) {
          if (typeof ref === 'function') {
            ref(el)
          } else {
            ref.current = el
          }
        }
      },
      style: {
        position: 'relative',
        userSelect: 'none',
        ...style,
      },
      ...rest,
    }
  }

  return {
    activeHandleIndex,
    getTrackProps,
    ticks,
    segments,
    handles,
  }
}
