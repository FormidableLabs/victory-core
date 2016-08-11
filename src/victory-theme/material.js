import { assign } from "lodash";

// *
// * Colors
// *
const yellow200 = "#FFF59D";
const deepOrange600 = "#F4511E";
const lime300 = "#DCE775";
const lightGreen500 = "#8BC34A";
const teal700 = "#00796B";
const cyan900 = "#006064";
const colors = [
  deepOrange600,
  yellow200,
  lime300,
  lightGreen500,
  teal700,
  cyan900
];
const blueGrey50 = "#ECEFF1";
const blueGrey300 = "#90A4AE";
const blueGrey700 = "#455A64";
const grey900 = "#212121";
// *
// * Typography
// *
const sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
const letterSpacing = "normal";
const fontSize = 12;
// *
// * Layout
// *
const padding = 8;
const props = {
  width: 350,
  height: 350,
  colorScale: colors
};
// *
// * Labels
// *
const baseLabelStyles = {
  fontFamily: sansSerif,
  fontSize,
  letterSpacing,
  padding,
  fill: blueGrey700
};
// *
// * Strokes
// *
const strokeDasharray = "10, 5";
const strokeLinecap = "round";
const strokeLinejoin = "round";

export default {
  area: {
    style: {
      data: {
        fill: grey900
      },
      labels: baseLabelStyles
    },
    props
  },
  axis: {
    style: {
      axis: {
        fill: "none",
        stroke: blueGrey300,
        strokeWidth: 2,
        strokeLinecap,
        strokeLinejoin
      },
      axisLabel: assign({}, baseLabelStyles,
        {
          padding,
          stroke: "transparent"
        }),
      grid: {
        fill: "none",
        stroke: blueGrey50,
        strokeDasharray,
        strokeLinecap,
        strokeLinejoin
      },
      ticks: {
        fill: "none",
        padding,
        size: 5,
        stroke: blueGrey300,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin
      },
      tickLabels: assign({}, baseLabelStyles,
        {
          fill: blueGrey700,
          stroke: "transparent"
        })
    },
    props
  },
  bar: {
    style: {
      data: {
        fill: blueGrey700,
        opacity: 1,
        padding,
        stroke: "transparent",
        strokeWidth: 0,
        width: 5
      },
      labels: baseLabelStyles
    },
    props
  },
  candlestick: {
    style: {
      data: {
        stroke: blueGrey700
      },
      labels: baseLabelStyles
    },
    props: assign({}, props,
      {
        candleColors: {
          positive: "#ffffff",
          negative: blueGrey700
        }
      })
  },
  errorbar: {
    style: {
      data: {
        fill: "none",
        opacity: 1,
        stroke: blueGrey700,
        strokeWidth: 2
      },
      labels: assign({}, baseLabelStyles,
        {
          stroke: "transparent",
          strokeWidth: 0,
          textAnchor: "start"
        })
    },
    props
  },
  line: {
    style: {
      data: {
        fill: "none",
        opacity: 1,
        stroke: blueGrey700,
        strokeWidth: 2
      },
      labels: assign({}, baseLabelStyles,
        {
          stroke: "transparent",
          strokeWidth: 0,
          textAnchor: "start"
        })
    },
    props
  },
  pie: {
    style: {
      data: {
        padding,
        stroke: blueGrey50,
        strokeWidth: 1
      },
      labels: assign({}, baseLabelStyles,
        {
          padding: 200,
          stroke: "transparent",
          strokeWidth: 0,
          textAnchor: "middle"
        })
    },
    props
  },
  scatter: {
    style: {
      data: {
        fill: blueGrey700,
        opacity: 1,
        stroke: "transparent",
        strokeWidth: 0
      },
      labels: Object.assign({}, baseLabelStyles,
        {
          stroke: "transparent",
          textAnchor: "middle"
        })
    },
    props
  },
  chart: {
    style: {},
    props
  },
  stack: {
    style: {},
    props
  },
  group: {
    style: {},
    props
  }
};
