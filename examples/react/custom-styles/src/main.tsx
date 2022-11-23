/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import ReactDOM from 'react-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { useRanger, Ranger } from '../../../../packages/react-ranger'

const GlobalStyles = createGlobalStyle`
  body {
   font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
   font-weight: 300;
  }
`

export const Track = styled('div')`
  height: 8px;
  width: 90%;
  position: relative;
  userselect: none;
  height: 4px;
  background: #ddd;
  boxshadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
  borderradius: 2px;
`

export const Tick = styled('div')`
  position: absolute;
  top: 5px;
  left: ${(props: { percentage: number }) => `${props.percentage}%`};
  transform: translateX(-50%);
  :before {
    content: '';
    position: absolute;
    left: 0;
    background: rgba(0, 0, 0, 0.2);
    height: 5px;
    width: 2px;
    transform: translate(-50%, 0.7rem);
  }
`

export const TickLabel = styled('div')`
  position: absolute;
  font-size: 0.6rem;
  color: rgba(0, 0, 0, 0.5);
  top: 100%;
  transform: translate(-50%, 1.2rem);
  white-space: nowrap;
`

export const Segment = styled('div')`
  position: absolute;
  background: ${(props: { index: number; left: number; width: number }) =>
    props.index === 0
      ? '#3e8aff'
      : props.index === 1
      ? '#00d5c0'
      : props.index === 2
      ? '#f5c200'
      : '#ff6050'};
  left: ${(props: { left: number }) => `${props.left}%`};
  height: 100%;
  width: ${(props: { width: number }) => `${props.width}%`};
`

export const Handle = styled('button')`
  position: absolute;
  left: ${(props: { left: number }) => `${props.left}%`};
  zIndex: isActive ? 1 : 0;
  appearance: none;
  border: none;
  outline: none;
  background: #ff1a6b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 100%;
  font-size: 0.7rem;
  white-space: nowrap;
  color: white;
  font-weight: ${(props: { active: boolean }) =>
    props.active ? 'bold' : 'normal'};
  transform: ${(props: { active: boolean }) =>
    props.active
      ? 'translate(-50%, -100%) scale(1.3)'
      : 'translate(-50%, -50%) scale(0.9)'};
`

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
      <GlobalStyles />
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

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
