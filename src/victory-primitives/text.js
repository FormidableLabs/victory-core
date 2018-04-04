import React from "react";
import PropTypes from "prop-types";
import Collection from "../victory-util/collection";
import { sanitizeSvgStyle } from "../victory-util/style";

export default class Text extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    desc: PropTypes.string,
    dx: PropTypes.number,
    dy: PropTypes.number,
    events: PropTypes.object,
    style: PropTypes.object,
    title: PropTypes.string,
    transform: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number
  };

  shouldComponentUpdate(nextProps) {
    return !Collection.areVictoryPropsEqual(this.props, nextProps);
  }

  render() {
    const {
      x, y, dx, dy, events, className, children, style, title, desc, transform
    } = this.props;
    return (
      <text
        className={className} x={x} dx={dx} y={y} dy={dy}
        transform={transform} style={sanitizeSvgStyle(style)}
        {...events}
      >
        {title && <title>{title}</title>}
        {desc && <desc>{desc}</desc>}
        {children}
      </text>
    );
  }
}
