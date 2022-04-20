---
name: useResizeColumns
route: /api/useResizeColumns
menu: API
---

# `useResizeColumns`

- Plugin Hook
- Optional

`useResizeColumns` is a plugin hook that adds support for resizing headers and cells when using non-table elements for layout eg. the `useBlockLayout` and `useAbsoluteLayout` hooks. It even supports resizing column groups!

### Table Options

- `disableResizing: Bool`
  - Defaults to `false`
  - When set to `true`, resizing is disabled across the entire table

### Column Options

The core column options `width`, `minWidth` and `maxWidth` are used to calculate column and cell widths and must be set. [See Column Options](#column-options) for more information on these options.

- `disableResizing: Bool`
  - Defaults to `false`
  - When set to `true`, resizing is disabled for this column

### Header Properties

- `getResizerProps`
  - **Usage Required**
  - This core prop getter is required to to enable absolute layout for headers
- `canResize: Bool`
  - Will be `true` if this column can be resized
- `isResizing: Bool`
  - Will be `true` if this column is currently being resized

### Example

- [Source](https://github.com/tanstack/react-table/tree/master/examples/column-resizing)
- [Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/react-table/tree/master/examples/column-resizing)
