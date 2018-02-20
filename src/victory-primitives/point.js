import React from "react";
import PropTypes from "prop-types";
import { evaluateProp, evaluateStyle } from "../victory-util/helpers";
import pathHelpers from "./path-helpers";
import CommonProps from "./common-props";
import Path from "./path";


export default class Point extends React.Component {
  static propTypes = {
    ...CommonProps,
    datum: PropTypes.object,
    getPath: PropTypes.func,
    pathComponent: PropTypes.element,
    size: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func
    ]),
    symbol: PropTypes.oneOfType([
      PropTypes.oneOf([
        "circle", "diamond", "plus", "minus", "square", "star", "triangleDown", "triangleUp"
      ]),
      PropTypes.func
    ]),
    x: PropTypes.number,
    y: PropTypes.number
  };

  static defaultProps = {
    pathComponent: <Path />
  };

  getPath(props) {
    const { datum, active, x, y } = props;
    const size = evaluateProp(props.size, datum, active);
    if (props.getPath) {
      return props.getPath(x, y, size);
    }
    const pathFunctions = {
      circle: pathHelpers.circle,
      square: pathHelpers.square,
      diamond: pathHelpers.diamond,
      triangleDown: pathHelpers.triangleDown,
      triangleUp: pathHelpers.triangleUp,
      plus: pathHelpers.plus,
      minus: pathHelpers.minus,
      star: pathHelpers.star
    };
    const symbol = evaluateProp(props.symbol, datum, active);
    const symbolFunction = typeof pathFunctions[symbol] === "function" ?
      pathFunctions[symbol] : pathFunctions.circle;
    return symbolFunction(x, y, size);
  }

  render() {
    const { active, datum, role, shapeRendering, className, events, pathComponent } = this.props;
    const style = evaluateStyle(this.props.style, datum, active);
    const d = this.getPath(this.props);
    return React.cloneElement(
      pathComponent, { style, role, shapeRendering, className, events, d }
    );
  }
}
