import React from "react";
import PropTypes from "prop-types";
import Collection from "../victory-util/collection";
import { sanitizeSvgStyle } from "../victory-util/style";

export default class TSpan extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dx: PropTypes.number,
    dy: PropTypes.number,
    events: PropTypes.object,
    style: PropTypes.object,
    textAnchor: PropTypes.oneOf(["start", "middle", "end", "inherit"]),
    x: PropTypes.number,
    y: PropTypes.number
  };

  shouldComponentUpdate(nextProps) {
    return !Collection.areVictoryPropsEqual(this.props, nextProps);
  }

  render() {
    const {
      x, y, dx, dy, events, className, style, textAnchor, content
    } = this.props;
    return (
      <tspan
        x={x} y={y} dx={dx} dy={dy} textAnchor={textAnchor}
        className={className}
        style={sanitizeSvgStyle(style)}
        {...events}
      >
        {content}
      </tspan>
    );
  }
}
