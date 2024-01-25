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

### ticks

```ts
ticks: Array<number>
```
An array of custom ticks to use. This will override `tickSize`

## API

### getTicks
```tsx
getTicks: () => ReadonlyArray<{value: number; key: number; percentage: number}>
```
Ticks to be rendered. Each `tick` has the following props:
  - `value: number` - The tick number to be displayed
  - `key: number` - The key of a tick
  - `percentage: number` - Percentage value of where tick should be placed on ranger
