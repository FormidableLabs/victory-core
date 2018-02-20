import { assign, isFunction, partialRight, defaults, isEmpty, fromPairs } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "../victory-util/prop-types";
import Events from "../victory-util/events";
import { reduceChildren } from "../victory-util/helpers";
import Timer from "../victory-util/timer";

export default class VictorySharedEvents extends React.Component {
  static displayName = "VictorySharedEvents";

  static role = "shared-event-wrapper";

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    container: PropTypes.node,
    eventKey: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ]),
    events: PropTypes.arrayOf(PropTypes.shape({
      childName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
      eventHandlers: PropTypes.object,
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      target: PropTypes.string
    })),
    externalEventMutations: PropTypes.arrayOf(PropTypes.shape({
      callback: PropTypes.function,
      childName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      mutation: PropTypes.function,
      target: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ])
    })),
    groupComponent: PropTypes.node
  };

  static defaultProps = {
    groupComponent: <g/>
  };

  static contextTypes = {
    getTimer: PropTypes.func
  };

  static childContextTypes = {
    getTimer: PropTypes.func
  };

  constructor() {
    super();
    this.state = this.state || {};
    this.getScopedEvents = Events.getScopedEvents.bind(this);
    this.getEventState = Events.getEventState.bind(this);
    this.getTimer = this.getTimer.bind(this);
  }

  getChildContext() {
    return {
      getTimer: this.getTimer
    };
  }

  componentWillMount() {
    this.setUpChildren(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.setUpChildren(newProps);
  }

  getTimer() {
    if (this.context.getTimer) {
      return this.context.getTimer();
    }
    if (!this.timer) {
      this.timer = new Timer();
    }
    return this.timer;
  }

  getAllEvents(props) {
    const components = ["container", "groupComponent"];
    this.componentEvents = Events.getComponentEvents(props, components);
    if (Array.isArray(this.componentEvents)) {
      return Array.isArray(props.events) ?
        this.componentEvents.concat(...props.events) : this.componentEvents;
    }
    return props.events;
  }

  setUpChildren(props) {
    this.events = this.getAllEvents(props);
    const { externalEventMutations, container, children } = props;
    if (this.events || !isEmpty(externalEventMutations)) {
      this.childComponents = React.Children.toArray(children);
      const childBaseProps = this.getBasePropsFromChildren(this.childComponents);
      const parentBaseProps = container ? container.props : {};
      const childNames = Object.keys(childBaseProps);
      this.baseProps = assign({}, childBaseProps, { parent: parentBaseProps });

      if (!isEmpty(externalEventMutations)) {
        const externalMutations = Events.getExternalMutationsWithChildren(
          externalEventMutations, this.baseProps, this.state, childNames
        );
        const callbacks = externalEventMutations.reduce((memo, mutation) => {
          memo = isFunction(mutation.callback) ? memo.concat(mutation.callback) : memo;
          return memo;
        }, []);
        const compiledCallbacks = callbacks.length ?
          () => { callbacks.forEach((c) => c()); } : undefined;
        this.setState(externalMutations, compiledCallbacks);
      }
    }
  }

  getBasePropsFromChildren(childComponents) {
    const iteratee = (child, childName, parent) => {
      if (child.type && isFunction(child.type.getBaseProps)) {
        child = parent ? React.cloneElement(child, parent.props) : child;
        const baseProps = child.props && child.type.getBaseProps(child.props);
        return baseProps ? [[childName, baseProps]] : null;
      } else {
        return null;
      }
    };

    const baseProps = reduceChildren(childComponents, iteratee);
    return fromPairs(baseProps);
  }

  getNewChildren(props) {
    const { events, eventKey } = props;
    const childNames = Object.keys(this.baseProps);
    const alterChildren = (children) => {
      return children.reduce((memo, child, index) => {
        if (child.props.children) {
          return memo.concat(React.cloneElement(
            child,
            child.props,
            alterChildren(React.Children.toArray(child.props.children))
          ));
        } else if (child.type && isFunction(child.type.getBaseProps)) {
          const name = child.props.name || childNames.shift() || index;
          const childEvents = Array.isArray(events) &&
            events.filter((event) => {
              if (event.target === "parent") {
                return false;
              }
              return Array.isArray(event.childName) ?
                event.childName.indexOf(name) > -1 :
                event.childName === name || event.childName === "all";
            });
          const sharedEvents = {
            events: childEvents,
            getEvents: partialRight(this.getScopedEvents, name, this.baseProps),
            getEventState: partialRight(this.getEventState, name)
          };
          return memo.concat(React.cloneElement(child, assign(
            { key: `events-${name}`, sharedEvents, eventKey, name },
            child.props
          )));
        } else {
          return memo.concat(child);
        }
      }, []);
    };

    return alterChildren(this.childComponents);
  }

  getContainer(props, children) {
    const parents = Array.isArray(this.events) &&
      this.events.filter((event) => event.target === "parent");
    const sharedEvents = parents.length > 0 ?
    {
      events: parents,
      getEvents: partialRight(this.getScopedEvents, null, this.baseProps),
      getEventState: partialRight(this.getEventState, null)
    } : null;
    const container = this.props.container || this.props.groupComponent;
    const role = container.type && container.type.role;
    const containerProps = container.props || {};
    const boundGetEvents = Events.getEvents.bind(this);
    const parentEvents = sharedEvents && boundGetEvents({ sharedEvents }, "parent");
    const parentProps = defaults(
      {},
      this.getEventState("parent", "parent"),
      containerProps,
      this.baseProps.parent,
      { children }
    );
    const events = defaults(
      {}, Events.getPartialEvents(parentEvents, "parent", parentProps), containerProps.events
    );
    return role === "container" ?
      React.cloneElement(container, assign({}, parentProps, { events })) :
      React.cloneElement(container, events, children);
  }

  render() {
    if (this.events) {
      const children = this.getNewChildren(this.props);
      return this.getContainer(this.props, children);
    }
    return React.cloneElement(this.props.container, { children: this.props.children });
  }
}
