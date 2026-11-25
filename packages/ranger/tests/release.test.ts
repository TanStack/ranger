import { afterEach, describe, expect, it, vi } from 'vitest'
import { Ranger } from '../src/index.js'

afterEach(() => vi.unstubAllGlobals())

describe('release after bounds change', () => {
  describe.each(['mouseup', 'touchend'])('%s', (releaseEvent) => {
    it.each([
      { values: [80], min: 0, max: 60, expected: [60] },
      { values: [20], min: 40, max: 100, expected: [40] },
      { values: [20, 80], min: 30, max: 60, expected: [30, 60] },
    ])(
      'keeps $values within [$min, $max]',
      ({ values, min, max, expected }) => {
        const document = new EventTarget()
        vi.stubGlobal('document', document)
        const onChange = vi.fn()
        const ranger = new Ranger({
          getRangerElement: () => ({
            getBoundingClientRect: () => ({ left: 0, width: 100 }),
          }),
          values,
          min: 0,
          max: 100,
          stepSize: 1,
          rerender: vi.fn(),
          onChange,
        })
        ranger._willUpdate()
        ranger.handlePress({}, values.length - 1)
        ranger.handleDrag({
          type: 'mousemove',
          clientX: values[values.length - 1],
        })
        ranger.setOptions({ ...ranger.options, min, max })
        document.dispatchEvent(new Event(releaseEvent))
        expect(onChange).toHaveBeenCalledOnce()
        expect(onChange.mock.calls[0]?.[0].sortedValues).toEqual(expected)
        expect(ranger.activeHandleIndex).toBeUndefined()
        expect(ranger.tempValues).toBeUndefined()
      },
    )
  })

  it('keeps an in-range value unchanged when the step size changes', () => {
    const document = new EventTarget()
    vi.stubGlobal('document', document)
    const ranger = new Ranger({
      getRangerElement: () => null,
      values: [43],
      min: 0,
      max: 100,
      stepSize: 1,
      rerender: vi.fn(),
    })
    ranger.handlePress({}, 0)
    ranger.setOptions({ ...ranger.options, max: 60, stepSize: 10 })
    document.dispatchEvent(new Event('mouseup'))
    expect(ranger.sortedValues).toEqual([43])
  })
})
