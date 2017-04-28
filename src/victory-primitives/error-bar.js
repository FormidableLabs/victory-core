/* eslint-disable max-statements */
import React from "react";
import PropTypes from "prop-types";
import { Helpers, Collection } from "../victory-util";
import { assign } from "lodash";

export default class ErrorBar extends React.Component {
  static propTypes = {
    active: PropTypes.bool,
    borderWidth: PropTypes.number,
    className: PropTypes.string,
    data: PropTypes.array,
    datum: PropTypes.object,
    errorX: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
      PropTypes.bool
    ]),
    errorY: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
      PropTypes.bool
    ]),
    events: PropTypes.object,
    groupComponent: PropTypes.element,
    index: PropTypes.number,
    role: PropTypes.string,
    scale: PropTypes.object,
    shapeRendering: PropTypes.string,
    style: PropTypes.object,
    x: PropTypes.number,
    y: PropTypes.number
  };

  static defaultProps = {
    borderWidth: 10,
    groupComponent: <g/>
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.style = this.getStyle(this.props);
  }

  shouldComponentUpdate(nextProps) {
    const { x, y, errorX, errorY } = this.props;
    const nextStyle = this.getStyle(nextProps);

    if (!Collection.allSetsEqual([
      [x, nextProps.x],
      [y, nextProps.y],
      [errorX, nextProps.errorX],
      [errorY, nextProps.errorY],
      [this.style, nextStyle]
    ])) {
      this.style = nextStyle;
      return true;
    }

    return false;
  }

  getStyle(props) {
    const { style, datum, active } = props;
    return Helpers.evaluateStyle(assign({ stroke: "black" }, style), datum, active);
  }

  // Overridden in victory-core-native
  renderLine(props, style, events) {
    return <line {...props} style={style} {...events}/>;
  }

  renderBorder(props, error, type) {
    const { x, y, borderWidth, events, style, role, shapeRendering, className } = props;
    const vertical = type === "Right" || type === "Left";
    const errorPortion = error[`error${type}`];
    const borderProps = {
      role, shapeRendering, className,
      key: `border${type}`,
      x1: vertical ? errorPortion : x - borderWidth,
      x2: vertical ? errorPortion : x + borderWidth,
      y1: vertical ? y - borderWidth : errorPortion,
      y2: vertical ? y + borderWidth : errorPortion
    };
    return this.renderLine(borderProps, style, events);
  }

  renderCross(props, error, type) {
    const { x, y, events, style, role, shapeRendering, className } = props;
    const vertical = type === "Top" || type === "Bottom";
    const errorPortion = error[`error${type}`];
    const borderProps = {
      role, shapeRendering, className,
      key: `cross${type}`,
      x1: x,
      x2: vertical ? x : errorPortion,
      y1: y,
      y2: vertical ? errorPortion : y
    };
    return this.renderLine(borderProps, style, events);
  }

  renderErrorBar(error, props) {
    const { groupComponent } = props;
    return React.cloneElement(groupComponent, {},
      error.errorRight ? this.renderBorder(props, error, "Right") : null,
      error.errorLeft ? this.renderBorder(props, error, "Left") : null,
      error.errorBottom ? this.renderBorder(props, error, "Bottom") : null,
      error.errorTop ? this.renderBorder(props, error, "Top") : null,
      error.errorRight ? this.renderCross(props, error, "Right") : null,
      error.errorLeft ? this.renderCross(props, error, "Left") : null,
      error.errorBottom ? this.renderCross(props, error, "Bottom") : null,
      error.errorTop ? this.renderCross(props, error, "Top") : null
    );
  }

  render() {
    const {
      x, y, borderWidth, groupComponent, events, errorX, errorY, scale, role,
      shapeRendering, className
    } = this.props;
    let rangeX;
    let rangeY;
    let positiveErrorX;
    let negativeErrorX;
    let positiveErrorY;
    let negativeErrorY;
    let errorTop;
    let errorBottom;
    let errorRight;
    let errorLeft;

    if (errorX) {
      rangeX = scale.x.range();
      positiveErrorX = errorX[0];
      negativeErrorX = errorX[1];
      errorRight = positiveErrorX >= rangeX[1] ? rangeX[1] : positiveErrorX;
      errorLeft = negativeErrorX <= rangeX[0] ? rangeX[0] : negativeErrorX;
    }

    if (errorY) {
      rangeY = scale.y.range();
      positiveErrorY = errorY[1];
      negativeErrorY = errorY[0];
      errorTop = positiveErrorY >= rangeY[0] ? rangeY[0] : positiveErrorY;
      errorBottom = negativeErrorY <= rangeY[1] ? rangeY[1] : negativeErrorY;
    }
    const props = {
      x, y, borderWidth, groupComponent, events, className,
      role: role || "presentation",
      shapeRendering: shapeRendering || "auto",
      style: this.style
    };
    return React.cloneElement(
      this.props.groupComponent,
      {},
      this.renderErrorBar({ errorTop, errorBottom, errorRight, errorLeft }, props)
    );
  }
}
