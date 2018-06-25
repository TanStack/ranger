const linearInterpolator = {
  getPercentageForValue: (val, min, max) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
  },
  getValueForClientX: (clientX, trackDims, min, max) => {
    const { left, width } = trackDims;
    const percentageValue = (clientX - left) / width
    const value = (max - min) * percentageValue
    return value + min
  },
}

export default linearInterpolator
