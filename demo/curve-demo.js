/* eslint-disable react/no-multi-comp */

import React from "react";
import { partialRight, assign } from "lodash";
import {
  Helpers, VictoryLabel, VictoryContainer, VictoryTheme, LabelHelpers, Scale,
  DefaultTransitions, Curve, VictoryClipContainer, Data, Domain, addEvents
} from "../src/index";

const LineHelpers = {
  getBaseProps(props, fallbackProps) {
    const modifiedProps = Helpers.modifyProps(props, fallbackProps, "line");
    props = assign({}, modifiedProps, this.getCalculatedValues(modifiedProps));
    const {
      data, domain, events, groupComponent, height, interpolation, origin, padding, polar,
      scale, sharedEvents, standalone, style, theme, width
    } = props;
    const initialChildProps = {
      parent: {
        style: style.parent, scale, data, height, width, domain, standalone, polar, origin, padding
      },
      all: { data:
        { polar, origin, scale, data, interpolation, groupComponent, theme, style: style.data }
      }
    };
    return data.reduce((childProps, datum, index) => {
      const text = LabelHelpers.getText(props, datum, index);
      if (text !== undefined && text !== null || events || sharedEvents) {
        const eventKey = datum.eventKey || index;
        childProps[eventKey] = { labels: LabelHelpers.getProps(props, index) };
      }
      return childProps;
    }, initialChildProps);
  },

  getCalculatedValues(props) {
    let data = Data.getData(props);

    if (data.length < 2) {
      data = [];
    }

    const range = {
      x: Helpers.getRange(props, "x"),
      y: Helpers.getRange(props, "y")
    };
    const domain = {
      x: Domain.getDomain(props, "x"),
      y: Domain.getDomain(props, "y")
    };
    const scale = {
      x: Scale.getBaseScale(props, "x").domain(domain.x).range(range.x),
      y: Scale.getBaseScale(props, "y").domain(domain.y).range(range.y)
    };
    const origin = props.polar ? props.origin || Helpers.getPolarOrigin(props) : undefined;
    const defaultStyles = props.theme && props.theme.line && props.theme.line.style ?
      props.theme.line.style : {};
    const style = Helpers.getStyles(props.style, defaultStyles);

    return { domain, data, scale, style, origin };
  }
};

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50,
  interpolation: "linear"
};

class VictoryLineBasic extends React.Component {
  static displayName = "VictoryLine";
  static role = "line";
  static defaultTransitions = DefaultTransitions.continuousTransitions();
  static defaultPolarTransitions = DefaultTransitions.continuousPolarTransitions();
  static continuous = true;

  static defaultProps = {
    samples: 50,
    scale: "linear",
    standalone: true,
    sortKey: "x",
    dataComponent: <Curve/>,
    labelComponent: <VictoryLabel renderInPortal/>,
    containerComponent: <VictoryContainer/>,
    groupComponent: <VictoryClipContainer/>,
    theme: VictoryTheme.grayscale
  };

  static getDomain = Domain.getDomain.bind(Domain);
  static getData = Data.getData.bind(Data);
  static getBaseProps = partialRight(LineHelpers.getBaseProps.bind(LineHelpers),
    fallbackProps);
  static expectedComponents = [
    "dataComponent", "labelComponent", "groupComponent", "containerComponent"
  ];

  render() {
    const { role } = this.constructor;
    const props = Helpers.modifyProps(this.props, fallbackProps, role);
    const children = this.renderContinuousData(props);
    return props.standalone ? this.renderContainer(props.containerComponent, children) : children;
  }
}

const VictoryLine = addEvents(VictoryLineBasic);

const data = [
  { x: 1, y: 1 },
  { x: 2, y: 3 },
  { x: 3, y: 1 },
  { x: 4, y: 5 },
  { x: 5, y: 1 }
];

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      interpolation: "linear",
      _interpolation: "linear"
    };
  }

  render() {
    const containerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center"
    };
    return (
      <div className="demo" style={containerStyle}>
        <VictoryLine data={data} interpolation={this.state.interpolation} />
        <input
          value={this.state._interpolation}
          onChange={(e) => this.setState({ _interpolation: e.target.value })}
        />
        <button
          onClick={() => this.setState({ interpolation: this.state._interpolation })}
        >
          Set Interpolation
        </button>
      </div>
    );
  }
}
