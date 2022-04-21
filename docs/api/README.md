---
name: Overview
route: /api
menu: API
---

# API

## Options

- `value: Array<number>` - The current value (or values) for the range
  - **Required**
- `min: number` - The minimum limit for the range
  - **Required**
- `max: number` - The maximum limit for the range
  - **Required**
- `stepSize: number` - The distance between selectable steps
  - **Required**
- `steps: arrayOf(number)` - An array of custom steps to use. This will override `stepSize`,
- `tickSize: number`
- `ticks: arrayOf(number): Default: 10` - An array of custom ticks to use. This will override `tickSize`,
- `onChange: Function(newValue)` - A function that is called when the handle is released
- `onDrag: Function(newValue)` - A function that is called when a handled is dragged
- `interpolator: { getPercentageForValue: Function(value) => decimal, getValueForClientX: Function(x) => value}`
  - The Interpolator to use
  - Defualts to the bundled linear-scale interpolator
    See the [Interpolation section](#interpolation) for more info

## Returns

`useRanger` returns an `object` with the following properties:

- `getTrackProps(userProps): func` - A function that takes optional props and returns the combined necessary props for the track component.
- `ticks: array` - Ticks to be rendered. Each `tick` has the following props:
  - `value: number` - The tick number to be displayed
  - `getTickProps(userProps): func` - A function that take optional props and returns the combined necessary props for the tick component.
- `segments: array` - Segments to be rendered. Each `segment` has the following props:
  - `value: number` - The segments ending value
  - `getSegmentProps(userProps): func` - A function that take optional props and returns the combined necessary props for the segment component.
- `handles: array` - Handles to be rendered. Each `handle` has the following props:
  - `value: number` - The current value for the handle
  - `active: boolean` - Denotes if the handle is currently being dragged.
  - `getHandleProps(userProps): func` - A function that take optional props and returns the combined necessary props for the handle component.
- `activeHandleIndex: oneOfType([null, number])` - The zero-based index of the handle that is currently being dragged, or `null` if no handle is being dragged.

## Interpolation

By default, `react-ranger` uses linear interpolation between data points, but allows you to easily customize it to use your own interpolation functions by passing an object that implements the following interface:

```
const interpolator = {
  // Takes the value & range and returns a percentage [0, 100] where the value sits from left to right
  getPercentageForValue: (val: number, min: number, max: number): number

  // Takes the clientX (offset from the left edge of the ranger) along with the dimensions
  // and range settings and transforms a pixel coordinate back into a value
  getValueForClientX: (clientX: number, trackDims: object, min: number, max: number): number
}
```

Here is an example of building and using a logarithmic interpolator!

```javascript
import { useRanger } from 'react-ranger'

const logInterpolator = {
  getPercentageForValue: (val, min, max) => {
    const minSign = Math.sign(min)
    const maxSign = Math.sign(max)

    if (minSign !== maxSign) {
      throw new Error(
        'Error: logarithmic interpolation does not support ranges that cross 0.'
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

useRanger({
  interpolator: logInterpolator,
})
```
