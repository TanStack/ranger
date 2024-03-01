import {
  Ref,
  unref,
  watch,
  computed,
  shallowRef,
  triggerRef
} from 'vue'

import { RangerConfig, RangerOptions, Ranger } from '@tanstack/ranger'

export * from '@tanstack/ranger'

type MaybeRef<T> = T | Ref<T>

function useRangerBase<TTrackElement> (
  options: Ref<RangerOptions<TTrackElement>>
): Ref<Ranger<TTrackElement>> {
  const rerender = () => {
    triggerRef(state)
  }

  const resolvedOptions: RangerConfig<TTrackElement> = {
    ...options.value,
    rerender,
    onChange: (instance: Ranger<TTrackElement>) => {
      triggerRef(state)
      options.value.onChange?.(instance)
    }
  }

  const ranger = new Ranger(resolvedOptions)
  const state = shallowRef(ranger)

  watch(
    () => unref(options).getRangerElement(),
    (el) => {
      if (el) {
        ranger._willUpdate()
      }
    },
    {
      immediate: true
    }
  )

  watch(
    options,
    (options) => {
      state.value.setOptions({
        ...options,
        rerender,
        onChange: (instance: Ranger<TTrackElement>) => {
          triggerRef(state)
          options.onChange?.(instance)
        }
      })

      ranger._willUpdate()
      triggerRef(state)
    },
    {
      immediate: true
    }
  )

  return state
}

export function useRanger<TTrackElement> (
  options: MaybeRef<RangerOptions<TTrackElement>>
): Ref<Ranger<TTrackElement>> {
  return useRangerBase(computed(() => ({
    ...unref(options)
  })))
}
