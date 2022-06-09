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
onChange: (newValue: number) => void
```
A function that is called when the handle is released.

## API

### getTrackProps
```tsx
getTrackProps: function
```
A function that takes optional props and returns the combined necessary props for the track component.

### handles
```tsx
handles: ReadonlyArray<{value: number; active: boolean; getHandleProps(userProps): function}>
```
Handles to be rendered. Each `handle` has the following props:
 - `value: number` - The current value for the handle.
 - `active: boolean` - Denotes if the handle is currently being dragged.
 - `getHandleProps(userProps): func` - A function that take optional props and returns the combined necessary props for the handle component.

### segments
```tsx
segments: ReadonlyArray<{value: number}; getSegmentProps(userProps): function>
```
Segments to be rendered. Each `segment` has the following props:
 - `value: number` - The segments ending value.
 - `getSegmentProps(userProps): func` - A function that take optional props and returns the combined necessary props for the segment component.

### activeHandleIndex
```tsx
activeHandleIndex: null | number
```
The zero-based index of the handle that is currently being dragged, or `null` if no handle is being dragged.
