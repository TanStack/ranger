const logInterpolator = {
  getPercentageForValue: (val, min, max) => {
    const minSign = Math.sign(min)
    const maxSign = Math.sign(max)

    if (minSign !== maxSign) {
      throw new Error(
        'Error: logarithmic interpolation does not support ranges that cross 0.'
      )
    }

    let percent = 100 / (Math.log10(Math.abs(max)) - Math.log10(Math.abs(min))) * (Math.log10(Math.abs(val)) - Math.log10(Math.abs(min)));

    if (minSign < 0) {
      // negative range, means we need to invert our percent because of the Math.abs above
      return 100 - percent;
    }
    
    return percent;
  },
  getValueForClientX: (clientX, trackDims, min, max) => {
    const { left, width } = trackDims;
    let value = clientX - left
    value *= Math.log10(max) - Math.log10(min);
    value /= width;
    value = Math.pow(10, Math.log10(min) + value);
    return value
  },
}

export default logInterpolator
