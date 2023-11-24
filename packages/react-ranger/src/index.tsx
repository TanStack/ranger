import * as React from 'react'
import { RangerConfig, RangerOptions, Ranger } from '@tanstack/ranger'

export * from '@tanstack/ranger'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export function useRanger<TTrackElement>(
  options: RangerOptions<TTrackElement>,
): Ranger<TTrackElement> {
  const rerender = React.useReducer(() => ({}), {})[1]
  const resolvedOptions: RangerConfig<TTrackElement> = {
    ...options,
    rerender,
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
