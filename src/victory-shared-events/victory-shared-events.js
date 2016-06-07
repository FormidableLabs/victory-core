import { isFunction, partialRight } from "lodash";
import React, { PropTypes } from "react";
import { PropTypes as CustomPropTypes, Events } from "../victory-util/index";

export default class VictorySharedEvents extends React.Component {
  static role = "shared-event-wrapper";

  static propTypes = {
    /**
     * VictoryEvents is a wrapper component that coordinates events between child components,
     */
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ]),
    /**
     * The event prop take an array of event objects. Event objects are composed of
     * a childName, target, eventKey, and eventHandlers. Targets may be any valid style namespace
     * for a given component, (i.e. "data" and "labels"). The childName will refer to an
     * individual child, either by its name prop, or by index. Only Victory components
     * that actually render data should be targeted for use with shared events. The eventKey
     * may optionally be used to select a single element by index or eventKey rather than
     * an entire set. The eventHandlers object should be given as an object whose keys are standard
     * event names (i.e. onClick) and whose values are event callbacks. The return value
     * of an event handler is used to modify elemnts. The return value should be given
     * as an object or an array of objects with optional target and eventKey and childName keys,
     * and a mutation key whose value is a function. The target and eventKey and childName keys
     * will default to those corresponding to the element the event handler was attached to.
     * The mutation function will be called with the calculated props for the individual selected
     * element (i.e. a single bar), and the object returned from the mutation function
     * will override the props of the selected element via object assignment.
     * @examples
     * events={[
     *   {
     *     target: "data",
     *     childName: "firstBar",
     *     eventHandlers: {
     *       onClick: () => {
     *         return [
     *            {
     *              childName: "secondBar",
     *              mutation: (props) => {
     *                return {style: merge({}, props.style, {fill: "orange"})};
     *              }
     *            }, {
     *              childName: "secondBar",
     *              target: "labels",
     *              mutation: () => {
     *                return {text: "hey"};
     *              }
     *            }
     *          ];
     *       }
     *     }
     *   }
     * ]}
     *}}
     */
    events: PropTypes.arrayOf(PropTypes.shape({
      childName: PropTypes.string,
      target: PropTypes.string,
      eventKey: PropTypes.oneOfType([
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    /**
     * Similar to data accessor props `x` and `y`, this prop may be used to functionally
     * assign eventKeys to data
     */
    eventKey: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ])
  };

  constructor() {
    super();
    this.state = {};
    this.getScopedEvents = Events.getScopedEvents.bind(this);
    this.getEventState = Events.getEventState.bind(this);
  }

  componentWillMount() {
    this.setUpChildren(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.setUpChildren(newProps);
  }

  setUpChildren(props) {
    this.childComponents = React.Children.toArray(props.children);
    this.baseProps = this.getBasePropsFromChildren(this.childComponents);
  }

  getBasePropsFromChildren(childComponents) {
    const getBaseProps = (children) => {
      return children.reduce((memo, child, index) => {
        if (child.type && isFunction(child.type.getBaseProps)) {
          const baseChildProps = child.props && child.type.getBaseProps(child.props);
          if (baseChildProps) {
            const childKey = child.props.name || index;
            memo[childKey] = baseChildProps;
            return memo;
          }
          return memo;
        } else if (child.props && child.props.children) {
          return getBaseProps(React.Children.toArray(child.props.children));
        }
        return memo;
      }, {});
    };
    return getBaseProps(childComponents);
  }

  getNewChildren(props) {
    const {events, eventKey} = props;
    const childNames = Object.keys(this.baseProps);

    const alterChildren = (children) => {
      return children.reduce((memo, child) => {
        if (child.type && isFunction(child.type.getBaseProps)) {
          const name = child.props.name || childNames.shift();
          const childEvents = Array.isArray(events) &&
            events.filter((event) => event.childName === name);
          const sharedEvents = {
            events: childEvents,
            getEvents: partialRight(this.getScopedEvents, name, this.baseProps),
            getEventState: partialRight(this.getEventState, name)
          };
          return memo.concat(React.cloneElement(child, Object.assign(
            { key: `events-${name}`, sharedEvents, eventKey },
            child.props
          )));
        } else if (child.props.children) {
          return memo.concat(React.cloneElement(
            child,
            child.props,
            alterChildren(React.Children.toArray(child.props.children))
          ));
        } else {
          return memo.concat(child);
        }
      }, []);
    };

    return alterChildren(this.childComponents);
  }

  render() {
    return <g>{this.getNewChildren(this.props)}</g>;
  }
}
