import { Helpers, Data, TextSize, Style } from "../victory-util/index";
import { defaults, merge, isEmpty, sumBy, maxBy } from "lodash";

export default {
  calculateLegendHeight(props, textSizes, padding, isHorizontal) { // eslint-disable-line max-params
    const { data, gutter } = props;
    const contentHeight = isHorizontal
      ? maxBy(textSizes, "height").height
      : sumBy(textSizes, "height") + gutter * (data.length - 1);

    return padding.top + contentHeight + padding.bottom;
  },

  calculateLegendWidth(props, textSizes, padding, isHorizontal) { // eslint-disable-line max-params
    const { data, gutter, symbolSpacer } = props;
    const contentWidth = isHorizontal
      ? sumBy(textSizes, "width") + (gutter + symbolSpacer * 3) * (data.length - 1)
      : maxBy(textSizes, "width").width + symbolSpacer * 2;

    return padding.left + contentWidth + padding.right;
  },

  getColorScale(props, theme) {
    const { colorScale } = props;
    let colorScaleOptions = colorScale || theme.colorScale;

    if (typeof colorScaleOptions === "string") {
      colorScaleOptions = Style.getColorScale(colorScaleOptions);
    }

    return !isEmpty(theme) ? colorScaleOptions || theme.colorScale : colorScaleOptions || [];
  },

  getSymbolSize(datum, fontSize) {
    return datum.symbol && datum.symbol.size ? datum.symbol.size : fontSize / 2.5;
  },

  getStyles(datum, props, theme, key, color) { // eslint-disable-line max-params
    const { style } = props;
    const styleKey = key === "symbol" ? "data" : key;
    const colorScaleStyle = color ? { fill: color } : {};
    const styles = merge({}, theme.style[styleKey], colorScaleStyle, style[styleKey], datum[key]);
    return Helpers.evaluateStyle(styles, datum);
  },

  getCalculatedValues(props) { // eslint-disable-line max-statements
    const { role } = this.constructor;
    const { data, orientation, theme } = props;
    let { height, padding, width } = props;

    const legendTheme = theme && theme[role] ? theme[role] : { style: {} };
    const parentStyles = this.getStyles({}, props, legendTheme, "parent");
    const colorScale = this.getColorScale(props, legendTheme);
    const isHorizontal = orientation === "horizontal";
    const symbolStyles = [];
    const labelStyles = [];
    let leftOffset = 0;

    padding = Helpers.getPadding({ padding: padding || theme.padding });
    height = Helpers.evaluateProp(height || theme.height, data);
    width = Helpers.evaluateProp(width || theme.width, data);

    const textSizes = data.map((datum, i) => {
      const labelStyle = this.getStyles(datum, props, legendTheme, "labels");
      symbolStyles[i] = this.getStyles(datum, props, legendTheme, "symbol", colorScale[i]);
      labelStyles[i] = labelStyle;

      const textSize = TextSize.approximateTextSize(datum.name, labelStyle);
      textSize.leftOffset = leftOffset;
      leftOffset += textSize.width;

      return textSize;
    });

    if (!height) {
      height = this.calculateLegendHeight(props, textSizes, padding, isHorizontal);
    }
    if (!width) {
      width = this.calculateLegendWidth(props, textSizes, padding, isHorizontal);
    }

    return {
      isHorizontal, height, labelStyles, padding, parentStyles, symbolStyles, textSizes, width
    };
  },

  getSymbolProps(datum, props, i) {
    const {
      dataComponent, gutter, padding, symbolSpacer,
      isHorizontal, labelStyles, symbolStyles, textSizes
    } = props;
    const { leftOffset } = textSizes[i];
    const { fontSize } = labelStyles[i];
    const symbolShift = fontSize / 2;
    const style = symbolStyles[i];

    const symbolCoords = isHorizontal ? {
      x: padding.left + leftOffset + symbolShift + (fontSize + symbolSpacer + gutter) * i,
      y: padding.top + symbolShift
    } : {
      x: padding.left + symbolShift,
      y: padding.top + symbolShift + (fontSize + gutter) * i
    };

    return defaults({},
      dataComponent.props,
      {
        key: `symbol-${i}`,
        style,
        size: this.getSymbolSize(datum, fontSize),
        symbol: style.type,
        ...symbolCoords
      }
    );
  },

  getLabelProps(datum, props, i) {
    const {
      gutter, symbolSpacer, labelComponent, padding, isHorizontal, labelStyles, textSizes
    } = props;
    const style = labelStyles[i];
    const { fontSize } = style;
    const symbolShift = fontSize / 2;

    const labelCoords = isHorizontal ? {
      x: padding.left + textSizes[i].leftOffset + (fontSize + symbolSpacer) * (i + 1) + gutter * i,
      y: padding.top + symbolShift
    } : {
      x: padding.left + fontSize + symbolSpacer,
      y: padding.top + symbolShift + (fontSize + gutter) * i
    };

    return defaults({},
      labelComponent.props,
      {
        key: `label-${i}`,
        style,
        text: datum.name,
        ...labelCoords
      }
    );
  },

  getBaseProps(props, fallbackProps) {
    props = Helpers.modifyProps(props, fallbackProps, "legend");
    const calculatedValues = this.getCalculatedValues(props);
    props = merge({}, props, calculatedValues);
    const data = Data.getData(props);

    const parentProps = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      style: props.parentStyles
    };
    const groupProps = {
      role: "presentation"
    };
    if (props.standalone) {
      merge(groupProps, parentProps);
    }
    const initialChildProps = {
      parent: parentProps,
      group: groupProps
    };
    return data.reduce((childProps, datum, index) => {
      const eventKey = datum.eventKey || index;
      childProps[eventKey] = {
        symbol: this.getSymbolProps(datum, props, index),
        label: this.getLabelProps(datum, props, index)
      };
      return childProps;
    }, initialChildProps);
  }
};
