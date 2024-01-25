---
name: Basic
route: /api/basic
menu: API
---

## Examples
Want to skip to the implementation? Check out these examples:

- [basic](../../examples/react/basic)

The API below described how to use the **basic** features.

## Options

### values

```tsx
values: ReadonlyArray<number>
```
**Required** The current value (or values) for the range.

### min

```tsx
min: number
```
**Required** The minimum limit for the range.

### max

```tsx
max: number
```
**Required** The maximum limit for the range.

### stepSize

```ts
stepSize: number
```
**Required** The distance between selectable steps.

### onChange

```ts
onChange: (instance: Ranger<TTrackElement>) => void
```
A function that is called when the handle is released.

## API

### handles
```tsx
handles: ReadonlyArray<{value: number; isActive: boolean; onKeyDownHandler(event): function; onMouseDownHandler(event): function; onTouchStart(event): function}>
```
Handles to be rendered. Each `handle` has the following props:
 - `value: number` - The current value for the handle.
 - `isActive: boolean` - Denotes if the handle is currently being dragged.
 - `onKeyDownHandler(event): func`
 - `onMouseDownHandler(event): func`
 - `onTouchStart(event): func`

### activeHandleIndex
```tsx
activeHandleIndex: null | number
```
The zero-based index of the handle that is currently being dragged, or `null` if no handle is being dragged.
