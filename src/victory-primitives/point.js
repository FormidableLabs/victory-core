import React, { PropTypes } from "react";
import Helpers from "../victory-util/helpers";
import pathHelpers from "./path-helpers";
import { isEqual } from "lodash";

export default class Point extends React.Component {
  static propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    datum: PropTypes.object,
    data: PropTypes.array,
    events: PropTypes.object,
    index: PropTypes.number,
    role: PropTypes.string,
    size: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func
    ]),
    shapeRendering: React.PropTypes.string,
    symbol: PropTypes.oneOfType([
      PropTypes.oneOf([
        "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
      ]),
      PropTypes.func
    ]),
    scale: PropTypes.object,
    style: PropTypes.object,
    x: PropTypes.number,
    y: PropTypes.number
  };

  componentWillMount() {
    const {style, path} = this.calculateAttributes(this.props);
    this.style = style;
    this.path = path;
  }

  shouldComponentUpdate(nextProps) {
    const {style, path} = this.calculateAttributes(nextProps);
    if (path !== this.path || !isEqual(style, this.style)) {
      this.style = style;
      this.path = path;
      return true;
    }
    return false;
  }

  calculateAttributes(props) {
    const { style, datum, active } = props;
    return {
      style: Helpers.evaluateStyle(style, datum, active),
      path: this.getPath(props)
    };
  }

  getPath(props) {
    const {datum, active, x, y} = props;
    const pathFunctions = {
      circle: pathHelpers.circle,
      square: pathHelpers.square,
      diamond: pathHelpers.diamond,
      triangleDown: pathHelpers.triangleDown,
      triangleUp: pathHelpers.triangleUp,
      plus: pathHelpers.plus,
      star: pathHelpers.star
    };
    const symbol = Helpers.evaluateProp(props.symbol, datum, active);
    const size = Helpers.evaluateProp(props.size, datum, active);
    return pathFunctions[symbol]({ x, y, size, precision: 2 });
  }

  // Overridden in victory-core-native
  renderPoint(path, style, events) {
    const { role, shapeRendering, className } = this.props;
    return (
      <path
        {...events}
        d={path}
        className={className}
        role={role || "presentation"}
        shapeRendering={shapeRendering || "auto"}
        style={style}
      />
    );
  }

  render() {
    return this.renderPoint(this.path, this.style, this.props.events);
  }
}
