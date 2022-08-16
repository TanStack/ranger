import { RangerOptions, Ranger } from '../../ranger-core/src'
import React from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export function useRanger<TTrackElement>(
  options: RangerOptions<TTrackElement>,
): Ranger<TTrackElement> {
  const rerender = React.useReducer(() => ({}), {})[1]

  const resolvedOptions: RangerOptions<TTrackElement> = {
    ...options,
    rerender: rerender,
    onChange: (instance) => {
      rerender()
      options.onChange?.(instance)
    },
  }

  const [instance] = React.useState(
    () => new Ranger<TTrackElement>(resolvedOptions),
  )

  instance.setOptions(resolvedOptions)

  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate()
  })

  return instance
}

export type { Ranger }
