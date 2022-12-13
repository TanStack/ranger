import React from 'react'
import ReactDOM from 'react-dom'
import { useRanger, Ranger } from '@tanstack/react-ranger'

function App() {
  const [values, setValues] = React.useState<ReadonlyArray<number>>([10])
  const rangerRef = React.useRef<HTMLDivElement>(null)

  const rangerInstance = useRanger<HTMLDivElement>({
    getRangerElement: () => rangerRef.current,
    values,
    min: 0,
    max: 100,
    stepSize: 5,
    onDrag: (instance: Ranger<HTMLDivElement>) =>
      setValues(instance.sortedValues),
  })

  return (
    <div className="App" style={{ padding: 10 }}>
      <h1>Update On Drag</h1>
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
