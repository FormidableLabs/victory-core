import React from "react";
import VictoryAnimation from "../victory-animation/victory-animation";
import { ContinuousTransitions, Transitions, TransitionHelpers } from "../victory-util/index";
import { defaults, pick } from "lodash";

export default class VictoryTransition extends React.Component {
  constructor(props) {
    super(props);
    const child = React.Children.toArray(props.children)[0];
    this.continuous = TransitionHelpers.checkContinuousChartType(child);
  }

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
    const child = React.Children.toArray(nextProps.children)[0];
    this.continuous = TransitionHelpers.checkContinuousChartType(child);
    if (this.continuous) {
      this.setState(this.getContinuousTransitionState(this.props, nextProps));
    } else {
      this.setState(this.getTransitionState(this.props, nextProps));
    }
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
      } = TransitionHelpers.getInitialTransitionState(oldChildren, nextChildren);
      return {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        oldProps: nodesWillExit ? props : null
      };
    }
  }

  getContinuousTransitionState(props, nextProps) {
    const { animate } = props;
    if (!animate) {
      return {};
    } else {
      const oldChildren = React.Children.toArray(props.children);
      const nextChildren = React.Children.toArray(nextProps.children);
      const {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldExit
      } = TransitionHelpers.getInitialTransitionState(oldChildren, nextChildren);
      return {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldExit,
        oldProps: nodesWillEnter || nodesWillExit ? props : null
      };
    }
  }

  render() {
    let props;
    let getTransitionProps;
    let domain;

    if (this.continuous) {
      props = this.state && (this.state.nodesWillEnter || this.state.nodesWillExit) ?
      this.state.oldProps : this.props;

      getTransitionProps = this.props.animate && this.props.animate.getTransitions ?
      this.props.animate.getTransitions :
      ContinuousTransitions.getTransitionPropsFactory(
        props,
        this.state,
        (newState) => this.setState(newState)
      );

      console.log('isContinuous')
      console.log(this.state && this.state.nodesWillExit
          ? TransitionHelpers.getDomainFromChildren(this.props, "x")
          : TransitionHelpers.getDomainFromChildren(props, "x"))

      domain = {
        x: this.state && this.state.nodesWillExit
          ? TransitionHelpers.getDomainFromChildren(this.props, "x")
          : TransitionHelpers.getDomainFromChildren(props, "x"),
        y: TransitionHelpers.getDomainFromChildren(props, "y")
      };
    } else {
      props = this.state && this.state.nodesWillExit ?
      this.state.oldProps : this.props;

      getTransitionProps = this.props.animate && this.props.animate.getTransitions ?
      this.props.animate.getTransitions :
      Transitions.getTransitionPropsFactory(
        props,
        this.state,
        (newState) => this.setState(newState)
      );

      domain = {
        x: TransitionHelpers.getDomainFromChildren(props, "x"),
        y: TransitionHelpers.getDomainFromChildren(props, "y")
      };
    }

    const child = React.Children.toArray(props.children)[0];
    const transitionProps = getTransitionProps(child);
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
