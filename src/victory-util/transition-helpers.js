/* eslint-disable func-style */
export function getDatumKey(datum, idx) {
  return (datum.key || idx).toString();
}

function getKeyedData(data) {
  return data.reduce((keyedData, datum, idx) => {
    const key = getDatumKey(datum, idx);
    keyedData[key] = datum;
    return keyedData;
  }, {});
}

function getKeyedDataDifference(a, b) {
  let hasDifference = false;
  const difference = Object.keys(a).reduce((_difference, key) => {
    if (!(key in b)) {
      hasDifference = true;
      _difference[key] = true;
    }
    return _difference;
  }, {});
  return hasDifference && difference;
}

/**
 * Calculate which data-points exist in oldData and not nextData -
 * these are the `entering` data-points.  Also calculate which
 * data-points exist in nextData and not oldData - these are the
 * `exiting` data-points.
 *
 * @param  {Array} oldData   this.props.data Array
 * @param  {Array} nextData  this.props.data Array
 *
 * @return {Object}          Object with `exiting` and `entering` properties.
 *                           exiting[datum.key] will be true if the data is
 *                           exiting, and similarly for `entering`.
 */
export function getNodeTransitions(oldData, nextData) {
  const oldDataKeyed = oldData && getKeyedData(oldData);
  const nextDataKeyed = nextData && getKeyedData(nextData);

  return {
    entering: oldDataKeyed && getKeyedDataDifference(nextDataKeyed, oldDataKeyed),
    exiting: nextDataKeyed && getKeyedDataDifference(oldDataKeyed, nextDataKeyed)
  };
}

export function getChildData(child) {
  if (child.type && child.type.getData) {
    return child.type.getData(child.props);
  }
  return child.props && child.props.data || false;
}

export function getChildTransitionDuration(child, type) {
  const animate = child.props.animate;
  const defaultTransitions = child.type && child.type.defaultTransitions;
  return animate[type] && animate[type].duration ||
    defaultTransitions[type] && defaultTransitions[type].duration;
}
