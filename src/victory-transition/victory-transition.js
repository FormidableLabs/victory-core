import React from "react";
import VictoryAnimation from "../victory-animation/victory-animation";
import { Transitions } from "../victory-util/index";
import { defaults, isFunction, pick, filter } from "lodash";

export default class VictoryTransition extends React.Component {
  static displayName = "VictoryTransition";

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
        nodesShouldEnter,
        nodesDoneClipPathEnter,
        nodesDoneClipPathExit
      } = Transitions.getInitialTransitionState(oldChildren, nextChildren);
      return {
        nodesWillExit,
        nodesWillEnter,
        childrenTransitions,
        nodesShouldEnter,
        nodesDoneClipPathEnter,
        nodesDoneClipPathExit,
        oldProps: nodesWillExit ? props : null
      };
    }
  }

  getDomainFromChildren(props, axis) {
    const getChildDomains = (children) => {
      return children.reduce((memo, child) => {
        if (child.type && isFunction(child.type.getDomain)) {
          const childDomain = child.props && child.type.getDomain(child.props, axis);
          return childDomain ? memo.concat(childDomain) : memo;
        } else if (child.props && child.props.children) {
          return memo.concat(getChildDomains(React.Children.toArray(child.props.children)));
        }
        return memo;
      }, []);
    };

    const childComponents = React.Children.toArray(props.children);
    if (props.domain && (Array.isArray(props.domain) || props.domain[axis])) {
      return Array.isArray(props.domain) ? props.domain : props.domain[axis];
    } else {
      const childDomains = getChildDomains(childComponents);
      return childDomains.length === 0 ?
        [0, 1] : [Math.min(...childDomains), Math.max(...childDomains)];
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
    const child = React.Children.toArray(props.children)[0];
    const transitionProps = getTransitionProps(child);
    const domain = {
      x: this.getDomainFromChildren(props, "x"),
      y: this.getDomainFromChildren(props, "y")
    };
    const combinedProps = defaults(
      {domain}, transitionProps, child.props
    );
    let animationWhitelist = props.animationWhitelist;

    if ((this.state && this.state.nodesDoneClipPathExit && this.state.nodesWillExit)
      || (transitionProps.animate
        && transitionProps.animate.parentState
        && transitionProps.animate.parentState.nodesDoneClipPathExit
        && transitionProps.animate.parentState.nodesWillExit)) {
      animationWhitelist = filter(props.animationWhitelist, (list) => {
        return list !== "clipWidth";
      });
    }

    const propsToAnimate = animationWhitelist ?
      pick(combinedProps, animationWhitelist) : combinedProps;
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
