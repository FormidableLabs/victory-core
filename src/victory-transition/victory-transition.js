import React from "react";
import VictoryAnimation from "../victory-animation/victory-animation";
import { Transitions, TransitionHelpers } from "../victory-util/index";
import { defaults, pick } from "lodash";

export default class VictoryTransition extends React.Component {
  static propTypes = {
    /**
     * The animate prop specifies an animation config for the transition.
     * This prop should be given as an object.
     */
    animate: React.PropTypes.object,
    /**
     * VictoryTransition animates a single child component
     */
    children: React.PropTypes.node,
    /**
     * This prop specifies which of the child's props are safe to interpolate.
     * This props should be given as an array.
     */
    animationWhitelist: React.PropTypes.array
  };

  componentWillReceiveProps(nextProps) {
    this.setState(this.getTransitionState(this.props, nextProps));
  }

  getTransitionState(props, nextProps) {
    const { animate } = props;
    if (!animate) {
      return {};
    } else if (animate.parentState) {
      const oldProps = animate.parentState.nodesWillExit ? props : null;
      return {oldProps};
    } else {
      const oldChildren = React.Children.toArray(props.children);
      const nextChildren = React.Children.toArray(nextProps.children);
      const {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter
      } = Transitions.getInitialTransitionState(oldChildren, nextChildren);
      return {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        oldProps: nodesWillExit ? props : null
      };
    }
  }

  render() {
    const props = this.state && this.state.nodesWillExit ?
      this.state.oldProps : this.props;
    const getTransitionProps = this.props.animate && this.props.animate.getTransitions ?
      this.props.animate.getTransitions :
      Transitions.getTransitionPropsFactory(
        props,
        this.state,
        (newState) => this.setState(newState)
      );

    // whitelist using continuous-transition, otherwise give warning.
    // eslint-disable-next-line max-len
    const whitelist = ["VictoryBar", "VictoryAxis", "VictoryCandlestick", "VictoryErrorBar", "VictoryScatter"];
    const child = React.Children.toArray(props.children)[0];

    if (whitelist.indexOf(child.type.displayName) === -1) {
      // eslint-disable-next-line no-console, max-len, no-undef
      console.warn("Component VictoryTransition should work with discrete charts, for continuous charts use VictoryContinuousTransition instead!");
    }

    const transitionProps = getTransitionProps(child);
    const domain = {
      x: TransitionHelpers.getDomainFromChildren(props, "x"),
      y: TransitionHelpers.getDomainFromChildren(props, "y")
    };
    const combinedProps = defaults(
      {domain}, transitionProps, child.props
    );
    const propsToAnimate = props.animationWhitelist ?
      pick(combinedProps, props.animationWhitelist) : combinedProps;
    return (
      <VictoryAnimation {...combinedProps.animate} data={propsToAnimate}>
        {(newProps) => {
          const component = React.cloneElement(
            child, defaults({animate: null}, newProps, combinedProps));
          return component;
        }}
      </VictoryAnimation>
    );
  }
}
