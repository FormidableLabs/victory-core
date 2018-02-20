import React from "react";
import PropTypes from "prop-types";
import VictoryPortal from "../victory-portal/victory-portal";
import CustomPropTypes from "../victory-util/prop-types";
import { scalePoint, evaluateStyle, evaluateProp } from "../victory-util/helpers";
import LabelHelpers from "../victory-util/label-helpers";
import Style from "../victory-util/style";
import { warn } from "../victory-util/log";
import TSpan from "../victory-primitives/tspan";
import Text from "../victory-primitives/text";
import { assign, merge, isEmpty } from "lodash";

const defaultStyles = {
  fill: "#252525",
  fontSize: 14,
  fontFamily: "'Gill Sans', 'Gill Sans MT', 'Ser­avek', 'Trebuchet MS', sans-serif",
  stroke: "transparent"
};

export default class VictoryLabel extends React.Component {
  static displayName = "VictoryLabel";
  static role = "label";
  static propTypes = {
    active: PropTypes.bool,
    angle: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    capHeight: PropTypes.oneOfType([
      PropTypes.string,
      CustomPropTypes.nonNegative,
      PropTypes.func
    ]),
    className: PropTypes.string,
    data: PropTypes.array,
    datum: PropTypes.any,
    desc: PropTypes.string,
    dx: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]),
    dy: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]),
    events: PropTypes.object,
    index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inline: PropTypes.bool,
    labelPlacement: PropTypes.oneOf(["parallel", "perpendicular", "vertical"]),
    lineHeight: PropTypes.oneOfType([
      PropTypes.string,
      CustomPropTypes.nonNegative,
      PropTypes.func,
      PropTypes.array
    ]),
    origin: PropTypes.shape({ x: CustomPropTypes.nonNegative, y: CustomPropTypes.nonNegative }),
    polar: PropTypes.bool,
    renderInPortal: PropTypes.bool,
    scale: PropTypes.shape({ x: CustomPropTypes.scale, y: CustomPropTypes.scale }),
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.func,
      PropTypes.array
    ]),
    textAnchor: PropTypes.oneOfType([
      PropTypes.oneOf([
        "start",
        "middle",
        "end",
        "inherit"
      ]),
      PropTypes.func
    ]),
    textComponent: PropTypes.element,
    title: PropTypes.string,
    transform: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.func
    ]),
    tspanComponent: PropTypes.element,
    verticalAnchor: PropTypes.oneOfType([
      PropTypes.oneOf([
        "start",
        "middle",
        "end"
      ]),
      PropTypes.func
    ]),
    x: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    y: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  };

  static defaultProps = {
    textComponent: <Text/>,
    tspanComponent: <TSpan/>,
    capHeight: 0.71, // Magic number from d3.
    lineHeight: 1
  };

  getPosition(props, dimension) {
    if (!props.datum) {
      return 0;
    }
    const scaledPoint = scalePoint(props, props.datum);
    return scaledPoint[dimension];
  }

  getStyle(props, style) {
    style = style ? merge({}, defaultStyles, style) : defaultStyles;
    const datum = props.datum || props.data;
    const baseStyles = evaluateStyle(style, datum, props.active);
    return assign({}, baseStyles, { fontSize: this.getFontSize(baseStyles) });
  }

  getStyles(props) {
    return Array.isArray(props.style) && !isEmpty(props.style) ?
      props.style.map((style) => this.getStyle(props, style)) : [this.getStyle(props, props.style)];
  }

  getHeight(props, type) {
    const datum = props.datum || props.data;
    return evaluateProp(props[type], datum, props.active);
  }

  getContent(props) {
    if (props.text === undefined || props.text === null) {
      return [" "];
    }
    const datum = props.datum || props.data;
    if (Array.isArray(props.text)) {
      return props.text.map((line) => evaluateProp(line, datum, props.active));
    }
    const child = evaluateProp(props.text, datum, props.active);
    return `${child}`.split("\n");
  }

  getDy(props, style, content, lineHeight) { //eslint-disable-line max-params
    style = Array.isArray(style) ? style[0] : style;
    lineHeight = this.checkLineHeight(lineHeight, lineHeight[0], 1);
    const fontSize = style.fontSize;
    const datum = props.datum || props.data;
    const dy = props.dy ? evaluateProp(props.dy, datum, props.active) : 0;
    const length = content.length;
    const capHeight = this.getHeight(props, "capHeight");
    const verticalAnchor = style.verticalAnchor || props.verticalAnchor;
    const anchor = verticalAnchor ?
      evaluateProp(verticalAnchor, datum) : "middle";
    switch (anchor) {
    case "end":
      return dy + (capHeight / 2 + (0.5 - length) * lineHeight) * fontSize;
    case "middle":
      return dy + (capHeight / 2 + (0.5 - length / 2) * lineHeight) * fontSize;
    default:
      return dy + (capHeight / 2 + lineHeight / 2) * fontSize;
    }
  }

  checkLineHeight(lineHeight, val, fallbackVal) {
    if (Array.isArray(lineHeight)) {
      return isEmpty(lineHeight) ? fallbackVal : val;
    }
    return lineHeight;
  }

  getTransform(props, style) {
    const { active, datum, x, y, polar } = props;
    const defaultAngle = polar ? LabelHelpers.getPolarAngle(props) : 0;
    const angle = style.angle || props.angle || defaultAngle;
    const transform = props.transform || style.transform;
    const transformPart = transform && evaluateProp(transform, datum, active);
    const rotatePart = angle && { rotate: [angle, x, y] };
    return transformPart || angle ?
      Style.toTransformString(transformPart, rotatePart) : undefined;
  }

  getFontSize(style) {
    const baseSize = style && style.fontSize;
    if (typeof baseSize === "number") {
      return baseSize;
    } else if (baseSize === undefined || baseSize === null) {
      return defaultStyles.fontSize;
    } else if (typeof baseSize === "string") {
      const fontSize = +baseSize.replace("px", "");
      if (!isNaN(fontSize)) {
        return fontSize;
      } else {
        warn("fontSize should be expressed as a number of pixels");
        return defaultStyles.fontSize;
      }
    }
    return defaultStyles.fontSize;
  }

  renderElements(props) {
    const { datum, active, inline, className, title, desc, events } = props;
    const style = this.getStyles(props);
    const lineHeight = this.getHeight(props, "lineHeight");
    const textAnchor = props.textAnchor ?
      evaluateProp(props.textAnchor, datum, active) : "start";
    const content = this.getContent(props);
    const dx = props.dx ? evaluateProp(props.dx, datum, active) : 0;
    const dy = this.getDy(props, style, content, lineHeight);
    const transform = this.getTransform(props, style);
    const x = typeof props.x !== "undefined" ? props.x : this.getPosition(props, "x");
    const y = typeof props.y !== "undefined" ? props.y : this.getPosition(props, "y");

    const textChildren = content.map((line, i) => {
      const currentStyle = style[i] || style[0];
      const lastStyle = style[i - 1] || style[0];
      const fontSize = (currentStyle.fontSize + lastStyle.fontSize) / 2;
      const currentLineHeight = this.checkLineHeight(
        lineHeight, ((lineHeight[i] + (lineHeight[i - 1] || lineHeight[0])) / 2), 1
      );

      const tspanProps = {
        key: i,
        x: !inline ? props.x : undefined,
        dx,
        dy: i && !inline ? (currentLineHeight * fontSize) : undefined,
        textAnchor: currentStyle.textAnchor || textAnchor,
        style: currentStyle,
        content: line
      };
      return React.cloneElement(props.tspanComponent, tspanProps);
    });
    return React.cloneElement(
      props.textComponent,
      { dx, dy, x, y, events, transform, className, title, desc },
      textChildren
    );
  }

  render() {
    const label = this.renderElements(this.props);
    return this.props.renderInPortal ? <VictoryPortal>{label}</VictoryPortal> : label;
  }
}
