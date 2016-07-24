/* eslint-disable func-style */
import React from "react";
import { isFunction } from "lodash";

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
function getNodeTransitions(oldData, nextData) {
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

export function getDomainFromChildren(props, axis) {
  const getChildDomains = (children) => {
    return children.reduce((memo, child) => {
      if (child.type && isFunction(child.type.getDomain)) {
        const childDomain = child.props && child.type.getDomain(child.props, axis);
        return childDomain ? memo.concat(childDomain) : memo;
      } else if (child.props && child.props.children) {
        return memo.concat(getChildDomains(React.Children.toArray(child.props.children)));
      }
      return memo;
    }, []);
  };

  const childComponents = React.Children.toArray(props.children);
  if (props.domain && (Array.isArray(props.domain) || props.domain[axis])) {
    return Array.isArray(props.domain) ? props.domain : props.domain[axis];
  } else {
    const childDomains = getChildDomains(childComponents);
    return childDomains.length === 0 ?
      [0, 1] : [Math.min(...childDomains), Math.max(...childDomains)];
  }
}


/**
 * If a parent component has animation enabled, calculate the transitions
 * for any data of any child component that supports data transitions
 * Data transitions are defined as any two datasets where data nodes exist
 * in the first set and not the second, in the second and not the first,
 * or both.
 *
 * @param  {Children}  oldChildren   this.props.children from old props
 * @param  {Children}  nextChildren  this.props.children from next props
 *
 * @return {Object}                  Object with the following properties:
 *                                    - nodesWillEnter
 *                                    - nodesWillExit
 *                                    - childrenTransitions
 *                                    - nodesShouldExit
 *                                    - nodesShouldEnter
 */

export function getInitialTransitionState(oldChildren, nextChildren) {
  let nodesWillExit = false;
  let nodesWillEnter = false;

  const getTransition = (oldChild, newChild) => {
    if (!newChild || oldChild.type !== newChild.type) {
      return {};
    }

    const { exiting, entering } =
      getNodeTransitions(getChildData(oldChild), getChildData(newChild)) || {};

    nodesWillEnter = nodesWillEnter || !!entering;
    nodesWillExit = nodesWillExit || !!exiting;

    return { entering: entering || false, exiting: exiting || false };
  };

  const getTransitionsFromChildren = (old, next) => {
    return old.map((child, idx) => {
      if (child.props.children) {
        return getTransitionsFromChildren(
          React.Children.toArray(old[idx].props.children),
          React.Children.toArray(next[idx].props.children)
        );
      }
      // get Transition exiting and enter nodes
      return getTransition(child, next[idx]);
    });
  };

  const childrenTransitions = getTransitionsFromChildren(
    React.Children.toArray(oldChildren),
    React.Children.toArray(nextChildren)
  );

  return {
    childrenTransitions,
    nodesWillExit,
    nodesWillEnter,
    // TODO: This may need to be refactored for the following situation.
    //       The component receives new props, and the data provided
    //       is a perfect match for the previous data and domain except
    //       for new nodes. In this case, we wouldn't want a delay before
    //       the new nodes appear.
    nodesShouldExit: false,
    nodesShouldEnter: false
  };
}


export function checkContinuousChartType(child) {
  const whitelistContinuous = ["line", "area"];

  if (whitelistContinuous.indexOf(child.type.role) === -1) {
    return false;
  }
  return true;
}
