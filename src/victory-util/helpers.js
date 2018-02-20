import React from "react";
import { defaults, isFunction, property, omit, reduce } from "lodash";
import Collection from "./collection";

const getPoint = (datum) => {
  const exists = (val) => val !== undefined;
  const { _x, _x1, _x0, _voronoiX, _y, _y1, _y0, _voronoiY } = datum;
  const defaultX = exists(_x1) ? _x1 : _x;
  const defaultY = exists(_y1) ? _y1 : _y;
  const point = {
    x: exists(_voronoiX) ? _voronoiX : defaultX,
    x0: exists(_x0) ? _x0 : _x,
    y: exists(_voronoiY) ? _voronoiY : defaultY,
    y0: exists(_y0) ? _y0 : _y
  };
  return defaults({}, point, datum);
};

const scalePoint = (props, datum) => {
  const { scale, polar } = props;
  const d = getPoint(datum);
  const origin = props.origin || { x: 0, y: 0 };
  const x = scale.x(d.x);
  const x0 = scale.x(d.x0);
  const y = scale.y(d.y);
  const y0 = scale.y(d.y0);
  return {
    x: polar ? y * Math.cos(x) + origin.x : x,
    x0: polar ? y0 * Math.cos(x0) + origin.x : x0,
    y: polar ? -y * Math.sin(x) + origin.y : y,
    y0: polar ? -y0 * Math.sin(x0) + origin.x : y0
  };
};

const formatPadding = (padding) => {
  const paddingVal = typeof padding === "number" ? padding : 0;
  const paddingObj = typeof padding === "object" ? padding : {};
  return {
    top: paddingObj.top || paddingVal,
    bottom: paddingObj.bottom || paddingVal,
    left: paddingObj.left || paddingVal,
    right: paddingObj.right || paddingVal
  };
};

const getPadding = (props) => {
  return formatPadding(props.padding);
};

const getStyles = (style, defaultStyles) => {
  const width = "100%";
  const height = "100%";
  if (!style) {
    return defaults({ parent: { height, width } }, defaultStyles);
  }
  const { data, labels, parent } = style;
  const defaultParent = defaultStyles && defaultStyles.parent || {};
  const defaultLabels = defaultStyles && defaultStyles.labels || {};
  const defaultData = defaultStyles && defaultStyles.data || {};
  return {
    parent: defaults({}, parent, defaultParent, { width, height }),
    labels: defaults({}, labels, defaultLabels),
    data: defaults({}, data, defaultData)
  };
};

const evaluateProp = (prop, data, active) => {
  return isFunction(prop) ? prop(data, active) : prop;
};

const evaluateStyle = (style, data, active) => {
  if (!style || !Object.keys(style).some((value) => isFunction(style[value]))) {
    return style;
  }
  return Object.keys(style).reduce((prev, curr) => {
    prev[curr] = evaluateProp(style[curr], data, active);
    return prev;
  }, {});
};

const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

const radiansToDegrees = (radians) => {
  return radians / (Math.PI / 180);
};

const getRadius = (props) => {
  const { left, right, top, bottom } = getPadding(props);
  const { width, height } = props;
  return Math.min(width - left - right, height - top - bottom) / 2;
};

const getPolarOrigin = (props) => {
  const { width, height } = props;
  const { top, bottom, left, right } = getPadding(props);
  const radius = Math.min(width - left - right, height - top - bottom) / 2;
  const offsetWidth = width / 2 + left - right;
  const offsetHeight = height / 2 + top - bottom;
  return {
    x: offsetWidth + radius > width ? radius + left - right : offsetWidth,
    y: offsetHeight + radius > height ? radius + top - bottom : offsetHeight
  };
};

const getCartesianRange = (props, axis) => {
  // determine how to lay the axis and what direction positive and negative are
  const isVertical = axis !== "x";
  const padding = getPadding(props);
  if (isVertical) {
    return [props.height - padding.bottom, padding.top];
  }
  return [padding.left, props.width - padding.right];
};

const getPolarRange = (props, axis) => {
  if (axis === "x") {
    const startAngle = degreesToRadians(props.startAngle || 0);
    const endAngle = degreesToRadians(props.endAngle || 360);
    return [startAngle, endAngle];
  }
  return [props.innerRadius || 0, getRadius(props)];
};

const getRange = (props, axis) => {
  if (props.range && props.range[axis]) {
    return props.range[axis];
  } else if (props.range && Array.isArray(props.range)) {
    return props.range;
  }
  return props.polar ? getPolarRange(props, axis) : getCartesianRange(props, axis);
};

const createAccessor = (key) => {
  // creates a data accessor function
  // given a property key, path, array index, or null for identity.
  if (isFunction(key)) {
    return key;
  } else if (key === null || typeof key === "undefined") {
    // null/undefined means "return the data item itself"
    return (x) => x;
  }
  // otherwise, assume it is an array index, property key or path (_.property handles all three)
  return property(key);
};

const modifyProps = (props, fallbackProps, role) => {
  const theme = props.theme && props.theme[role] ? props.theme[role] : {};
  const themeProps = omit(theme, ["style"]);
  return defaults({}, props, themeProps, fallbackProps);
};

  // Axis helpers

  /**
   * Returns the given axis or the opposite axis when horizontal
   * @param {string} axis: the given axis, either "x" pr "y"
   * @param {Boolean} horizontal: true when the chart is flipped to the horizontal orientation
   * @returns {String} the dimension appropriate for the axis given its props "x" or "y"
   */
const getCurrentAxis = (axis, horizontal) => {
  const otherAxis = axis === "x" ? "y" : "x";
  return horizontal ? otherAxis : axis;
};

  /**
   * @param {Object} props: axis component props
   * @returns {Boolean} true when the axis is vertical
   */
const isVertical = (props) => {
  const orientation = props.orientation || (props.dependentAxis ? "left" : "bottom");
  const vertical = { top: false, bottom: false, left: true, right: true };
  return vertical[orientation];
};

  /**
   * @param {Object} props: axis component props
   * @returns {Boolean} true when tickValues contain strings
   */
const stringTicks = (props) => {
  return props.tickValues !== undefined && Collection.containsStrings(props.tickValues);
};

  /**
   * @param {Array} children: an array of child components
   * @param {Function} iteratee: a function with arguments "child", "childName", and "parent"
   * @returns {Array} returns an array of results from calling the iteratee on all nested children
   */
const reduceChildren = (children, iteratee) => {
  let childIndex = 0;
  const traverseChildren = (childArray, parent) => {
    return reduce(childArray, (memo, child) => {
      const childName = child.props.name || childIndex;
      childIndex++;
      if (child.props && child.props.children) {
        const nestedChildren = React.Children.toArray(child.props.children);
        const nestedResults = traverseChildren(nestedChildren, child);
        memo = memo.concat(nestedResults);
      } else {
        const result = iteratee(child, childName, parent);
        memo = result ? memo.concat(result) : memo;
      }
      return memo;
    }, []);
  };
  return traverseChildren(children);
};

export {
  getPoint,
  scalePoint,
  getPadding,
  formatPadding,
  getStyles,
  evaluateProp,
  evaluateStyle,
  degreesToRadians,
  radiansToDegrees,
  getRadius,
  getPolarOrigin,
  getCartesianRange,
  getPolarRange,
  getRange,
  createAccessor,
  modifyProps,
  getCurrentAxis,
  isVertical,
  stringTicks,
  reduceChildren
};
