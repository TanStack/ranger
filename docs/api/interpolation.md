---
name: Interpolation
route: /api/interpolation
menu: API
---

## Examples
Want to skip to the implementation? Check out these examples:

- [logarithmic-interpolator](../examples/logarithmic-interpolator)

The API below described how to use the **interpolation** feature.

## Interpolation Option

By default, `react-ranger` uses linear interpolation between data points, but allows you to easily customize it to use your own interpolation functions by passing an object that implements the following interface:

## Interpolation API

```
const interpolator = {
  // Takes the value & range and returns a percentage [0, 100] where the value sits from left to right
  getPercentageForValue: (val: number, min: number, max: number): number

  // Takes the clientX (offset from the left edge of the ranger) along with the dimensions
  // and range settings and transforms a pixel coordinate back into a value
  getValueForClientX: (clientX: number, trackDims: object, min: number, max: number): number
}
```
