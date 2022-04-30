/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import ReactDOM from "react-dom";
import { useRanger } from "react-ranger";

function App() {
  const [values, setValues] = React.useState([0, 500000]);

  const { getTrackProps, ticks, handles } = useRanger({
    values,
    onChange: setValues,
    min: 1000,
    max: 500000,
    steps: [0, 20000, 100000, 250000, 500000],
    ticks: [0, 100000, 250000, 500000]
  });

  return (
    <div className="App">
      <h1>Custom Steps</h1>
      <br />
      <br />
      <div
        {...getTrackProps({
          style: {
            height: "4px",
            background: "#ddd",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,.6)",
            borderRadius: "2px",
            margin: "0 100px"
          }
        })}
      >
        {ticks.map(({ value, getTickProps }) => (
          <div {...getTickProps()}>{value}</div>
        ))}
        {handles.map(({ getHandleProps }) => (
          <button
            {...getHandleProps({
              style: {
                width: "14px",
                height: "14px",
                outline: "none",
                borderRadius: "100%",
                background: "linear-gradient(to bottom, #eee 45%, #ddd 55%)",
                border: "solid 1px #888"
              }
            })}
          />
        ))}
      </div>
      <br />
      <br />
      <br />
      <pre
        style={{
          display: "inline-block",
          textAlign: "left"
        }}
      >
        <code>
          {JSON.stringify({
            values
          })}
        </code>
      </pre>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

