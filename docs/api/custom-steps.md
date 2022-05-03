---
name: Basic
route: /api/basic
menu: API
---

## Examples
Want to skip to the implementation? Check out these examples:

- [basic](../examples/basic)

The API below described how to use the **basic** features.

## Options

### values

```tsx
values: Array<number>
```
**Required** The current value (or values) for the range

### min

```tsx
min: number
```
**Required** The minimum limit for the range

### max

```tsx
max: number
```
**Required** The maximum limit for the range

### stepSize

```ts
stepSize: number
```
**Required** The distance between selectable steps

### onChange

```ts
onChange: (newValue: number) => void
```
A function that is called when the handle is released









### steps

```ts
steps: Array<number>
```
An array of custom steps to use. This will override `stepSize`

### tickSize

```ts
tickSize: number = 10
```
Size of tick

### ticks

```ts
ticks: Array<number>
```
An array of custom ticks to use. This will override `tickSize`


### onDrag

```ts
onDrag: (newValue: number) => void
```
A function that is called when a handled is dragged

### interpolator

```ts
interpolator: { getPercentageForValue: (value) => decimal, getValueForClientX: (x) => value }
```
The Interpolator to use. Defaults to the bundled linear-scale interpolator

## API

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
