---
name: Concepts
route: /concepts
---

# Concepts

## React Ranger is a "headless" UI library

React Ranger is a headless utility, which means out of the box, it doesn't render or supply any actual UI elements. You are in charge of utilizing the state and callbacks of the hooks provided by this library to render your own table markup. [Read this article to understand why React Ranger is built this way](https://www.merrickchristensen.com/articles/headless-user-interface-components/). If you don't want to, then here's a quick rundown anyway:

- Separation of Concerns - Not that superficial kind you read about all the time. The real kind. React Ranger as a library honestly has no business being in charge of your UI. The look, feel, and overall experience of your table is what makes your app or product great. The less React Ranger gets in the way of that, the better!
- Maintenance - By removing the massive (and seemingly endless) API surface area required to support every UI use-case, React Ranger can remain small, easy-to-use and simple to update/maintain.
- Extensibility - UI presents countless edge cases for a library simply because it's a creative medium, and one where every developer does things differently. By not dictating UI concerns, React Ranger empowers the developer to design and extend the UI based on their unique use-case.

## The React Ranger instance

At the heart of every React Ranger is the `useRanger` hook. This hook will return and object with everything you'll ever need to build a ranger and interact with its state. This includes, but is not limited to:

- Value Range
- Snap Interpolation
- Ticks (labels) generation

After reading about React Ranger's concepts, you should:
- [Check Out Some Examples](./examples)
