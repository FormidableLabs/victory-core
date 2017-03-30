import React, { PropTypes } from "react";
import { assign, omit, defaults } from "lodash";
import Portal from "../victory-portal/portal";
import { Timer } from "../victory-util/index";
import { default as VictoryTheme } from "../victory-theme/victory-theme";

const fallbackProps = {
  theme: VictoryTheme.grayscale
};

export default class VictoryContainer extends React.Component {
  static displayName = "VictoryContainer";
  static role = "container";
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number,
    events: PropTypes.object,
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ]),
    title: PropTypes.string,
    desc: PropTypes.string,
    portalComponent: PropTypes.element,
    responsive: PropTypes.bool,
    standalone: PropTypes.bool,
    theme: PropTypes.object
  }

  static defaultProps = {
    portalComponent: <Portal/>,
    responsive: true
  }

  static contextTypes = {
    getTimer: React.PropTypes.func
  }

  static childContextTypes = {
    portalUpdate: React.PropTypes.func,
    portalRegister: React.PropTypes.func,
    portalDeregister: React.PropTypes.func,
    getTimer: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.getTimer = this.getTimer.bind(this);
  }

  componentWillMount() {
    this.savePortalRef = (portal) => this.portalRef = portal;
    this.portalUpdate = (key, el) => this.portalRef.portalUpdate(key, el);
    this.portalRegister = () => this.portalRef.portalRegister();
    this.portalDeregister = (key) => this.portalRef.portalDeregister(key);
  }

  componentWillUnmount() {
    if (!this.context.getTimer) {
      this.getTimer().stop();
    }
  }

  getChildContext() {
    return this.props.standalone !== false ?
      {
        portalUpdate: this.portalUpdate,
        portalRegister: this.portalRegister,
        portalDeregister: this.portalDeregister,
        getTimer: this.getTimer
      } : {};
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

  // overridden in custom containers
  getChildren(props) {
    return props.children;
  }

  // Overridden in victory-core-native
  renderContainer(props, svgProps, style) {
    const { title, desc, portalComponent, className, standalone } = props;
    const children = this.getChildren(props);
    const parentProps = defaults({style, className}, svgProps);
    const groupComponent = props.groupComponent || <g/>;
    return standalone !== false ?
      (
        <svg {...parentProps}>
          {title ? <title id="title">{title}</title> : null}
          {desc ? <desc id="desc">{desc}</desc> : null}
          {children}
          {React.cloneElement(portalComponent, {ref: this.savePortalRef})}
        </svg>
      ) :
      React.cloneElement(groupComponent, parentProps, children);
  }

  render() {
    const props = defaults({}, this.props, fallbackProps);
    const { width, height, responsive, events, standalone } = props;
    const style = responsive ? props.style : omit(props.style, ["height", "width"]);
    const svgProps = assign(
      {
        width, height,
        "aria-labelledby": standalone !== false ? "title desc" : undefined,
        role: standalone !== false ? "img" : "presentation",
        viewBox: responsive && standalone !== false ? `0 0 ${width} ${height}` : undefined
      },
      events
    );
    return this.renderContainer(props, svgProps, style);
  }
}
