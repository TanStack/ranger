/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { useRanger, Ranger } from '@tanstack/react-ranger'
import { createRoot } from 'react-dom/client'
import './style.css';

export const Track = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
  return <div className='track' ref={ref} {...props} />
})

export const Tick = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement> & { percentage: number }>(({ percentage, style, ...props }, ref) => {
  return (
    <div
      className='tick'
      ref={ref}
      style={{
        left: `${percentage}%`,
        ...style,
      }}
      {...props}
    />
  )
})

export const TickLabel = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
  return <div className='tick-label' ref={ref} {...props} />
})

export const Segment = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement> & {
  index: number,
  left: number,
}>(({ index, left, width, style, ...props }, ref) => {
  return (
    <div
      className='segment'
      ref={ref}
      style={{
        background: index === 0
          ? '#3e8aff'
          : index === 1
            ? '#00d5c0'
            : index === 2
              ? '#f5c200'
              : '#ff6050',
        left: `${left}%`,
        width: `${width}%`,
        ...style,
      }}
      {...props}
    />
  )
})

export const Handle = React.forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement> & {
  left: number,
  active: boolean,
}>(({ left, active, type, style, ...props }, ref) => {
  return (
    <button
      type="button"
      className='handle'
      ref={ref}
      style={{
        left: `${left}%`,
        zIndex: active ? 1 : 0,
        fontWeight: active ? 'bold' : 'normal',
        transform: active
          ? 'translate(-50%, -100%) scale(1.3)'
          : 'translate(-50%, -50%) scale(0.9)',
        ...style
      }}
      {...props} />
  )
})


function App() {
  const rangerRef = React.useRef<HTMLDivElement>(null)
  const [values, setValues] = React.useState<ReadonlyArray<number>>([
    15, 50, 80,
  ])

  const rangerInstance = useRanger<HTMLDivElement>({
    getRangerElement: () => rangerRef.current,
    values,
    min: 0,
    max: 100,
    stepSize: 1,
    onChange: (instance: Ranger<HTMLDivElement>) =>
      setValues(instance.sortedValues),
  })

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Custom Styles</h1>
      <br />
      <br />
      <Track ref={rangerRef}>
        {rangerInstance.getTicks().map(({ value, key, percentage }) => (
          <Tick key={key} percentage={percentage}>
            <TickLabel>{value}</TickLabel>
          </Tick>
        ))}
        {rangerInstance.getSteps().map(({ left, width }, i) => (
          <Segment key={i} index={i} left={left} width={width} />
        ))}
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
              <Handle
                key={i}
                onKeyDown={onKeyDownHandler}
                onMouseDown={onMouseDownHandler}
                onTouchStart={onTouchStart}
                role="slider"
                aria-valuemin={rangerInstance.options.min}
                aria-valuemax={rangerInstance.options.max}
                aria-valuenow={value}
                left={rangerInstance.getPercentageForValue(value)}
                active={isActive}
              >
                {value}
              </Handle>
            ),
          )}
      </Track>
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

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
