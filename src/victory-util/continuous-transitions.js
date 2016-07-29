/* eslint-disable func-style */
import { assign, defaults, identity, filter } from "lodash";
import {
  getDatumKey,
  getChildData,
  getChildTransitionDuration
} from "./transition-helpers";

function getInitialChildProps(animate, data) {
  const after = animate.onExit && animate.onExit.after ? animate.onExit.after : identity;
  return {
    data: data.map((datum) => assign({}, datum, after(datum)))
  };
}

function getChildPropsOnEnter(animate, data, enteringNodes, cb) { // eslint-disable-line max-params
  // Whether or not _this_ child has entering nodes, we want the enter-
  // transition for all children to have the same duration, delay, etc.
  const onEnter = animate && animate.onEnter;
  animate = assign({}, animate, onEnter);

  if (enteringNodes) {
    // After the enter transition occurs, trigger the animations for
    // nodes that are neither entering or exiting.
    animate.onEnd = cb;
    const before = animate.onEnter && animate.onEnter.before ? animate.onEnter.before : identity;
    // If nodes need to enter, transform them with the provided onEnter.before function.
    data = data.map((datum, idx) => {
      const key = (datum.key || idx).toString();
      return enteringNodes[key] ? assign({}, datum, before(datum)) : datum;
    });
  }
  return { animate, data };
}

function getChildPropsBeforeExit(animate, data, exitingNodes, cb) { // eslint-disable-line max-params,max-len
  if (exitingNodes) {
    // Perform a normal animation here, except - when it finishes - trigger
    // the transition for exiting nodes.
    animate = assign({}, animate, { onEnd: cb });
    const before = animate.onExit && animate.onExit.before ? animate.onExit.before : identity;
    // We want the exiting nodes to be included in the transition target
    // domain.  However, we may not want these nodes to be displayed initially,
    // so perform the `onExit.before` transformation on each node.
    data = data.map((datum, idx) => {
      const key = (datum.key || idx).toString();
      return exitingNodes[key] ? assign({}, datum, before(datum)) : datum;
    });
  }

  return { animate, data };
}

function getChildPropsOnExit(animate, data, exitingNodes) {
  // Whether or not _this_ child has exiting nodes, we want the exiting-
  // transition for all children to have the same duration, delay, etc.
  const onExit = animate && animate.onExit;
  animate = assign({}, animate, onExit);

  if (exitingNodes) {
    // Old nodes have been transitioned to their new values, and the
    // domain should encompass the nodes that will now exit. So perform
    // the `onExit.after` transformation on each node.
    // QUESTION: should onExit have a after key?
    // const after = animate.onExit && animate.onExit.after ? animate.onExit.after : identity;
    data = data.map((datum, idx) => {
      const key = getDatumKey(datum, idx);
      return exitingNodes[key] ? null : datum;
    });

    data = filter(data, (d) => d !== null);
  }

  return { animate, data };
}

/**
 * getTransitionPropsFactory - putting the Java in JavaScript.  This will return a
 * function that returns prop transformations for a child, given that child's props
 * and its index in the parent's children array.
 *
 * In particular, this will include an `animate` object that is set appropriately
 * so that each child will be synchoronized for each stage of a transition
 * animation.  It will also include a transformed `data` object, where each datum
 * is transformed by `animate.onEnter` and `animate.onExit` `before` and `after`
 * functions.
 *
 * @param  {Object}  props       `this.props` for the parent component.
 * @param  {Object} state        `this.state` for the parent component.
 * @param  {Function} setState    Function that, when called, will `this.setState` on
 *                                 the parent component with the provided object.
 *
 * @return {Function}              Child-prop transformation function.
 */
export function getTransitionPropsFactory(props, state, setState) {
  const nodesWillEnter = state && state.nodesWillEnter;
  const nodesWillExit = state && state.nodesWillExit;
  const nodesShouldExit = state && state.nodesShouldExit;
  const childrenTransitions = state && state.childrenTransitions || [];
  const transitionDurations = {
    exit: props.animate && props.animate.onExit && props.animate.onExit.duration,
    enter: props.animate && props.animate.onEnter && props.animate.onEnter.duration,
    move: props.animate && props.animate.duration
  };

  const onEnter = (nodes, data, animate) => {
    return getChildPropsOnEnter(animate, data, nodes, () => {
      setState({ nodesWillEnter: false });
    });
  };

  const onExit = (nodes, data, animate) => {
    return nodesShouldExit ?
      getChildPropsOnExit(animate, data, nodes) :
      getChildPropsBeforeExit(animate, data, nodes, () => {
        setState({ nodesShouldExit: true });
      });
  };

  return function getTransitionProps(child, index) { // eslint-disable-line max-statements
    const data = getChildData(child) || [];
    const animate = defaults({}, props.animate, child.props.animate);

    animate.onEnter = defaults(
      {}, animate.onEnter, child.type.defaultTransitions && child.type.defaultTransitions.onEnter
    );
    animate.onExit = defaults(
      {}, animate.onExit, child.type.defaultTransitions && child.type.defaultTransitions.onExit
    );

    const childTransitions = childrenTransitions[index] || childrenTransitions[0];
    if (nodesWillEnter) {
      const enteringNodes = childTransitions && childTransitions.entering;
      const enter = transitionDurations.enter || getChildTransitionDuration(child, "onEnter");
      // if nodesWillEnter, but this child has no entering nodes, set a delay instead of a duration
      const animation = enteringNodes ? {duration: enter} : {delay: enter};
      return onEnter(enteringNodes, data, assign({}, animate, animation));
    } else if (nodesWillExit) {
      const exitingNodes = childTransitions && childTransitions.exiting;
      const exit = transitionDurations.exit || getChildTransitionDuration(child, "onExit");
      const move = transitionDurations.move ||
        child.props.animate && child.props.animate.duration;
      const animation = { duration: nodesShouldExit && exitingNodes ? exit : move };
      return onExit(exitingNodes, data, assign({}, animate, animation));
    } else if (!state && animate && animate.onEnter) {
      // This is the initial render, and nodes may exit when props change. Because
      // animation interpolation is determined by old- and next- props, data may need
      // to be augmented with certain properties.
      //
      // For example, it may be desired that entering nodes go from `opacity: 1` to
      // `opacity: 0`. Without setting this on a per-datum basis, the interpolation
      // might go from `opacity: undefined` to `opacity: 0`, which would result in
      // interpolated `opacity: NaN` values.
      //
      return getInitialChildProps(animate, data);
    }
    return { animate, data };

  };
}
