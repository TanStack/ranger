---
name: Custom Styles
route: /api/custom-styles
menu: API
---

## Examples
Want to skip to the implementation? Check out these examples:

- [custom-styles](../examples/custom-styles)

The API below described how to use the **custom-steps** features.

## API

### getSegments
```tsx
getSegments: () => ReadonlyArray<{left: number; width: number}>
```
Segments to be rendered. Each `segment` has the following props:
  - `left: number` - Percentage value of where segment should start on ranger
  - `width: number` - Percentage value of segment width 
