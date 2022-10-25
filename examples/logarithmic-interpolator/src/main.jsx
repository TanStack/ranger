/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import ReactDOM from 'react-dom'
import { useRanger } from 'react-ranger'

const logInterpolator = {
  getPercentageForValue: (val, min, max) => {
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
  getValueForClientX: (clientX, trackDims, min, max) => {
    const { left, width } = trackDims
    let value = clientX - left
    value *= Math.log10(max) - Math.log10(min)
    value /= width
    value = Math.pow(10, Math.log10(min) + value)
    return value
  },
}

function App() {
  const [values, setValues] = React.useState([10])

  const { getTrackProps, handles, ticks } = useRanger({
    min: 1,
    max: 100,
    stepSize: 1,
    values,
    onChange: setValues,
    interpolator: logInterpolator,
  })

  return (
    <div className="App">
      <h1>Logarithmic interpolator</h1>
      <br />
      <br />
      <div
        {...getTrackProps({
          style: {
            height: '4px',
            background: '#ddd',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
            borderRadius: '2px',
          },
        })}
      >
        {ticks.map(({ value, getTickProps }) => (
          <div {...getTickProps()}>{value}</div>
        ))}
        {handles.map(({ getHandleProps }) => (
          <button
            {...getHandleProps({
              style: {
                width: '14px',
                height: '14px',
                outline: 'none',
                borderRadius: '100%',
                background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
                border: 'solid 1px #888',
              },
            })}
          />
        ))}
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
