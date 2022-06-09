/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import ReactDOM from "react-dom";
import { useRanger } from "react-ranger";

function App() {
  const [values, setValues] = React.useState([10]);

  const { getTrackProps, handles } = useRanger({
    values,
    min: 0,
    max: 100,
    stepSize: 5,
    onChange: setValues
  });

  return (
    <div className="App">
      <h1>Basic Range</h1>
      <br />
      <br />
      <div
        {...getTrackProps({
          style: {
            height: "4px",
            background: "#ddd",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,.6)",
            borderRadius: "2px"
          }
        })}
      >
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
