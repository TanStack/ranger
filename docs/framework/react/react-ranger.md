---
title: React Ranger
---

You can install TanStack Ranger with any [NPM](https://npmjs.com) package manager.

```sh
npm install @tanstack/react-ranger
```

## React Compiler

`useRanger` currently returns a stable, mutable instance. React Compiler can memoize reads such as `rangerInstance.handles()`, leaving the rendered handles and their `aria-valuenow` attributes out of sync with the current values.

As a temporary workaround, add [`'use no memo'`](https://react.dev/reference/react-compiler/directives/use-no-memo) at the beginning of the component that calls `useRanger` and renders the slider:

```tsx
function RangeSlider() {
  'use no memo'

  // Keep your existing useRanger call and slider rendering here.
}
```

Avoid manually memoizing instance-dependent reads with `useMemo`; the instance keeps the same reference when its internal state changes. If you split the slider into multiple components, those reads must also stay outside memoized render paths.

Follow [#106](https://github.com/TanStack/ranger/issues/106) for React Compiler compatibility updates.
