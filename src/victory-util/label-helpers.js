import { evaluateProp, scalePoint, degreesToRadians, radiansToDegrees, getPoint } from "./helpers";

export const getText = (props, datum, index) => {
  if (datum.label !== undefined) {
    return datum.label;
  }
  return Array.isArray(props.labels) ? props.labels[index] : props.labels;
};

export const getVerticalAnchor = (props, datum) => {
  const sign = datum._y >= 0 ? 1 : -1;
  const labelStyle = props.style && props.style.labels || {};
  if (datum.getVerticalAnchor || labelStyle.verticalAnchor) {
    return datum.getVerticalAnchor || labelStyle.verticalAnchor;
  } else if (!props.horizontal) {
    return sign >= 0 ? "end" : "start";
  } else {
    return "middle";
  }
};

export const getTextAnchor = (props, datum) => {
  const { style, horizontal } = props;
  const sign = datum._y >= 0 ? 1 : -1;
  const labelStyle = style && style.labels || {};
  if (datum.getVerticalAnchor || labelStyle.verticalAnchor) {
    return datum.getVerticalAnchor || labelStyle.verticalAnchor;
  } else if (!horizontal) {
    return "middle";
  } else {
    return sign >= 0 ? "start" : "end";
  }
};

export const getAngle = (props, datum) => {
  const labelStyle = props.style && props.style.labels || {};
  return datum.angle || labelStyle.angle;
};

export const getPadding = (props, datum) => {
  const { horizontal, style, active } = props;
  const labelStyle = style.labels || {};
  const defaultPadding = evaluateProp(labelStyle.padding, datum, active) || 0;
  const sign = datum._y < 0 ? -1 : 1;
  return {
    x: horizontal ? sign * defaultPadding : 0,
    y: horizontal ? 0 : sign * defaultPadding
  };
};

export const getDegrees = (props, datum) => {
  const { x } = getPoint(datum);
  return radiansToDegrees(props.scale.x(x));
};

export const getPolarPadding = (props, datum) => {
  const { active, style } = props;
  const degrees = getDegrees(props, datum);
  const labelStyle = style.labels || {};
  const padding = evaluateProp(labelStyle.padding, datum, active) || 0;
  const angle = degreesToRadians(degrees);
  return {
    x: padding * Math.cos(angle), y: -padding * Math.sin(angle)
  };
};

export const getPosition = (props, datum) => {
  const { horizontal, polar } = props;
  const { x, y } = scalePoint(props, datum);
  const padding = getPadding(props, datum);
  if (!polar) {
    return {
      x: horizontal ? y + padding.x : x + padding.x,
      y: horizontal ? x + padding.y : y - padding.y
    };
  } else {
    const polarPadding = getPolarPadding(props, datum);
    return {
      x: x + polarPadding.x,
      y: y + polarPadding.y
    };
  }
};

export const getLabelPlacement = (props) => {
  const { labelComponent, labelPlacement, polar } = props;
  const defaultLabelPlacement = polar ? "perpendicular" : "vertical";
  return labelPlacement ?
    labelPlacement :
    labelComponent.props && labelComponent.props.labelPlacement || defaultLabelPlacement;
};

export const getPolarOrientation = (degrees) => {
  if (degrees < 45 || degrees > 315) { // eslint-disable-line no-magic-numbers
    return "right";
  } else if (degrees >= 45 && degrees <= 135) { // eslint-disable-line no-magic-numbers
    return "top";
  } else if (degrees > 135 && degrees < 225) { // eslint-disable-line no-magic-numbers
    return "left";
  } else {
    return "bottom";
  }
};

export const getPolarTextAnchor = (props, degrees) => {
  const labelPlacement = getLabelPlacement(props);
  if (
    labelPlacement === "perpendicular" ||
    labelPlacement === "vertical" && (degrees === 90 || degrees === 270)
  ) {
    return "middle";
  }
  return degrees <= 90 || degrees > 270 ? "start" : "end";
};

export const getPolarVerticalAnchor = (props, degrees) => {
  const labelPlacement = getLabelPlacement(props);
  const orientation = getPolarOrientation(degrees);
  if (labelPlacement === "parallel" || orientation === "left" || orientation === "right") {
    return "middle";
  }
  return orientation === "top" ? "end" : "start";
};

export const getPolarAngle = (props, baseAngle) => {
  const { labelPlacement, datum } = props;
  if (!labelPlacement || labelPlacement === "vertical") {
    return 0;
  }
  const degrees = baseAngle !== undefined ? baseAngle : getDegrees(props, datum);
  const sign = (degrees > 90 && degrees < 180 || degrees > 270) ? 1 : -1;
  let angle;
  if (degrees === 0 || degrees === 180) {
    angle = 90;
  } else if (degrees > 0 && degrees < 180) {
    angle = 90 - degrees;
  } else if (degrees > 180 && degrees < 360) {
    angle = 270 - degrees;
  }
  const labelRotation = labelPlacement === "perpendicular" ? 0 : 90;
  return angle + sign * labelRotation;
};

export const getProps = (props, index) => {
  const { scale, data, style, horizontal, polar } = props;
  const datum = data[index];
  const degrees = getDegrees(props, datum);
  const textAnchor = polar ?
    getPolarTextAnchor(props, degrees) : getTextAnchor(props, datum);
  const verticalAnchor = polar ?
     getPolarVerticalAnchor(props, degrees) : getVerticalAnchor(props, datum);
  const angle = getAngle(props, datum);
  const text = getText(props, datum, index);
  const labelPlacement = getLabelPlacement(props);
  const { x, y } = getPosition(props, datum);
  return {
    angle, data, datum, horizontal, index, polar, scale, labelPlacement,
    text, textAnchor, verticalAnchor, x, y, style: style.labels
  };
};
