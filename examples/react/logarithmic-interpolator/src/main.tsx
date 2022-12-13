import React from 'react'
import ReactDOM from 'react-dom'
import { useRanger, Ranger } from '@tanstack/react-ranger'

const logInterpolator = {
  getPercentageForValue: (val: number, min: number, max: number) => {
    const minSign = Math.sign(min)
    const maxSign = Math.sign(max)

    if (minSign !== maxSign) {
      throw new Error(
        'Error: logarithmic interpolation does not support ranges that cross 0.',
      )
    }

    let percent =
      (100 / (Math.log10(Math.abs(max)) - Math.log10(Math.abs(min)))) *
      (Math.log10(Math.abs(val)) - Math.log10(Math.abs(min)))

    if (minSign < 0) {
      // negative range, means we need to invert our percent because of the Math.abs above
      return 100 - percent
    }

    return percent
  },
  getValueForClientX: (
    clientX: number,
    trackDims: { width: number; left: number },
    min: number,
    max: number,
  ) => {
    const { left, width } = trackDims
    let value = clientX - left
    value *= Math.log10(max) - Math.log10(min)
    value /= width
    value = Math.pow(10, Math.log10(min) + value)
    return value
  },
}

function App() {
  const [values, setValues] = React.useState<ReadonlyArray<number>>([10])
  const rangerRef = React.useRef<HTMLDivElement>(null)

  const rangerInstance = useRanger<HTMLDivElement>({
    getRangerElement: () => rangerRef.current,
    values,
    min: 1,
    max: 100,
    stepSize: 1,
    onChange: (instance: Ranger<HTMLDivElement>) =>
      setValues(instance.sortedValues),
    interpolator: logInterpolator,
  })

  return (
    <div className="App" style={{ padding: 10 }}>
      <h1>Basic Range</h1>
      <span>Active Index: {rangerInstance.activeHandleIndex}</span>
      <br />
      <br />
      <div
        ref={rangerRef}
        style={{
          position: 'relative',
          userSelect: 'none',
          height: '4px',
          background: '#ddd',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
          borderRadius: '2px',
        }}
      >
        {rangerInstance
          .handles()
          .map(
            (
              {
                value,
                onKeyDownHandler,
                onMouseDownHandler,
                onTouchStart,
                isActive,
              },
              i,
            ) => (
              <button
                key={i}
                onKeyDown={onKeyDownHandler}
                onMouseDown={onMouseDownHandler}
                onTouchStart={onTouchStart}
                role="slider"
                aria-valuemin={rangerInstance.options.min}
                aria-valuemax={rangerInstance.options.max}
                aria-valuenow={value}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${rangerInstance.getPercentageForValue(value)}%`,
                  zIndex: isActive ? '1' : '0',
                  transform: 'translate(-50%, -50%)',
                  width: '14px',
                  height: '14px',
                  outline: 'none',
                  borderRadius: '100%',
                  background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
                  border: 'solid 1px #888',
                }}
              />
            ),
          )}
      </div>
      <br />
      <br />
      <br />
      <pre
        style={{
          display: 'inline-block',
          textAlign: 'left',
        }}
      >
        <code>
          {JSON.stringify({
            values,
          })}
        </code>
      </pre>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
