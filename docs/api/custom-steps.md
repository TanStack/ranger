---
name: Custom Steps
route: /api/custom-steps
menu: API
---

## Examples
Want to skip to the implementation? Check out these examples:

- [custom-steps](../examples/custom-steps)

The API below described how to use the **custom-steps** features.

## Options

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

## API

### ticks
```tsx
ticks: ReadonlyArray<{value: number; getTickProps: function}>
```
Ticks to be rendered. Each `tick` has the following props:
  - `value: number` - The tick number to be displayed
  - `getTickProps(userProps): func` - A function that take optional props and returns the combined necessary props for the tick component.
