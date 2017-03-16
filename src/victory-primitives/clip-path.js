import React, { PropTypes } from "react";
import {
  PropTypes as CustomPropTypes, Helpers, Collection
} from "../victory-util";
import addComputedProps from "react-computed-props";

class ClipPath extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    clipId: PropTypes.number,
    clipPadding: PropTypes.shape({
      top: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number
    }),
    clipHeight: CustomPropTypes.nonNegative,
    clipWidth: CustomPropTypes.nonNegative,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    // computed properties
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  };

  static defaultProps = {
    translateX: 0,
    translateY: 0
  }

  shouldComponentUpdate(nextProps) {
    return !Collection.isEqualBy(this.props, nextProps, ["clipId", "x", "y", "height", "width"]);
  }

  // Overridden in victory-core-native
  renderClipPath(props, id) {
    return (
      <defs>
        <clipPath id={id}>
          <rect {...props}/>
        </clipPath>
      </defs>
    );
  }

  render() {
    const { clipId, className, x, y, width, height } = this.props;
    const clipProps = { className, x, y, width, height };
    return this.renderClipPath(clipProps, clipId);
  }
}

const calculateAttributes = (props) => {
  const { clipWidth, clipHeight, translateX, translateY } = props;
  const padding = Helpers.getPadding(props);
  const clipPadding = Helpers.getPadding({ padding: props.clipPadding });

  const totalPadding = (side) => {
    return padding[side] - clipPadding[side];
  };
  return {
    x: totalPadding("left") + translateX,
    y: totalPadding("top") + translateY,
    width: Math.max(clipWidth - totalPadding("left") - totalPadding("right"), 0),
    height: Math.max(clipHeight - totalPadding("top") - totalPadding("bottom"), 0)
  };
};

export default addComputedProps(calculateAttributes, { alwaysRecompute: true })(ClipPath);
