import React, { PropTypes } from "react";
import {
  PropTypes as CustomPropTypes, Helpers, addEvents
} from "../victory-util/index";
import { partialRight } from "lodash";
import VictoryLabel from "../victory-label/victory-label";
import VictoryContainer from "../victory-container/victory-container";
import VictoryTheme from "../victory-theme/victory-theme";
import Point from "../victory-primitives/point";
import LegendHelpers from "./helper-methods";

const fallbackProps = {
  data: [
    { name: "Series 1" },
    { name: "Series 2" }
  ]
};

class VictoryLegend extends React.Component {
  static displayName = "VictoryLegend";

  static role = "legend";

  static propTypes = {
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "grayscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    containerComponent: PropTypes.element,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.object,
        symbol: PropTypes.object
      })
    ),
    dataComponent: PropTypes.element,
    events: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOf(["all"]),
      eventHandlers: PropTypes.object
    })),
    groupComponent: PropTypes.element,
    gutter: PropTypes.number,
    height: PropTypes.oneOfType([
      CustomPropTypes.nonNegative,
      PropTypes.func
    ]),
    labelComponent: PropTypes.element,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]),
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    standalone: PropTypes.bool,
    style: PropTypes.shape({
      data: PropTypes.object,
      labels: PropTypes.object,
      parent: PropTypes.object
    }),
    symbolSpacer: PropTypes.number,
    theme: PropTypes.object,
    width: PropTypes.oneOfType([
      CustomPropTypes.nonNegative,
      PropTypes.func
    ]),
    x: PropTypes.number,
    y: PropTypes.number
  };

  static defaultProps = {
    containerComponent: <VictoryContainer/>,
    dataComponent: <Point/>,
    groupComponent: <g/>,
    gutter: 10,
    labelComponent: <VictoryLabel/>,
    orientation: "vertical",
    standalone: true,
    style: {},
    symbolSpacer: 8,
    theme: VictoryTheme.grayscale,
    x: 0,
    y: 0
  };

  static getBaseProps = partialRight(LegendHelpers.getBaseProps.bind(LegendHelpers), fallbackProps);
  static expectedComponents = [
    "groupComponent", "containerComponent", "dataComponent", "labelComponent"
  ];

  renderLegendItems(props) {
    const { data, dataComponent, labelComponent } = props;

    const dataComponents = data.map((datum, i) => {
      return React.cloneElement(
        dataComponent,
        this.getComponentProps(dataComponent, "symbol", i)
      );
    });

    const labelComponents = data.map((datum, i) => {
      return React.cloneElement(
        labelComponent,
        this.getComponentProps(labelComponent, "label", i)
      );
    });

    return [...dataComponents, ...labelComponents];
  }

  renderGroup(props, children) {
    const { groupComponent } = props;
    const groupProps = this.getComponentProps(groupComponent, "group", "group");
    return React.cloneElement(groupComponent, groupProps, children);
  }

  renderContainer(props, children) {
    const { containerComponent } = props;
    const parentProps = this.getComponentProps(containerComponent, "parent", "parent");
    return React.cloneElement(containerComponent, parentProps, children);
  }

  render() {
    const { role } = this.constructor;
    const props = Helpers.modifyProps(this.props, fallbackProps, role);
    const group = this.renderGroup(props, this.renderLegendItems(props));
    return props.standalone ? this.renderContainer(props, group) : group;
  }
}

export default addEvents(VictoryLegend);
