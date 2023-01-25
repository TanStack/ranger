export const getBoundingClientRect = (element: any) => {
  const rect = element.getBoundingClientRect()
  return {
    left: Math.ceil(rect.left),
    width: Math.ceil(rect.width),
  }
}

export const sortNumList = (arr: ReadonlyArray<number | string>) =>
  [...arr].map(Number).sort((a, b) => a - b)

export const linearInterpolator = {
  getPercentageForValue: (val: number, min: number, max: number) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
  },
  getValueForClientX: (
    clientX: number,
    trackDims: { width: number; left: number },
    min: number,
    max: number,
  ) => {
    const { left, width } = trackDims
    const percentageValue = (clientX - left) / width
    const value = (max - min) * percentageValue
    return value + min
  },
}
