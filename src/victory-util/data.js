import { assign, uniq, range, last, isFunction, property, sortBy } from "lodash";
import Helpers from "./helpers";
import Collection from "./collection";
import Scale from "./scale";
import Immutable from "./immutable";

export default {
  datumWhitelist: [
    // Data coordinates
    "x", "y", "y0", "_x", "_y", "_y0",
    // Svg style properties (https://www.w3.org/TR/SVG2/styling.html#PresentationAttributes)
    "alignment-baseline", "baseline-shift", "clip", "clip-path", "clip-rule", "color",
    "color-interpolation", "color-interpolation-filters", "color-rendering", "cursor", "direction",
    "display", "dominant-baseline", "fill", "fill-opacity", "fill-rule", "filter", "flood-color",
    "flood-opacity", "font", "font-family", "font-size", "font-size-adjust", "font-stretch",
    "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal",
    "glyph-orientation-vertical", "image-rendering", "letter-spacing", "lighting-color", "marker",
    "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events",
    "shape-rendering", "solid-color", "solid-opacity", "stop-color", "stop-opacity", "stroke",
    "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
    "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-anchor", "text-decoration",
    "text-overflow", "text-rendering", "unicode-bidi", "vector-effect", "visibility", "white-space",
    "word-spacing", "writing-mode",
    // Special case properties
    "angle", "label", "width", "symbol", "size", "verticalAnchor", "sortKey", "eventKey"
  ],
  /**
   * Returns an array of formatted data
   * @param {Object} props: the props object
   * @returns {Array} an array of data
   */
  getData(props) {
    let data;
    if (props.data) {
      if (Immutable.isIterable(props.data) ? props.data.size < 1 : props.data.length < 1) {
        return [];
      } else {
        data = this.formatData(props.data, props);
      }
    } else {
      data = this.formatData(this.generateData(props), props);
    }
    return this.addEventKeys(props, data);
  },

  /**
   * Returns generated data for a given axis based on domain and sample from props
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Array} an array of data
   */
  generateDataArray(props, axis) {
    const propsDomain = props.domain && Array.isArray(props.domain) ?
      props.domain : props.domain && props.domain[axis];
    const domain = propsDomain || Scale.getBaseScale(props, axis).domain();
    const samples = props.samples || 1;
    const domainMax = Math.max(...domain);
    const domainMin = Math.min(...domain);
    const step = (domainMax - domainMin) / samples;
    const values = range(domainMin, domainMax, step);
    return last(values) === domainMax ? values : values.concat(domainMax);
  },

  /**
   * Returns generated x and y data based on domain and sample from props
   * @param {Object} props: the props object
   * @returns {Array} an array of data
   */
  generateData(props) {
    const xValues = this.generateDataArray(props, "x");
    const yValues = this.generateDataArray(props, "y");
    const values = xValues.map((x, i) => {
      return { x, y: yValues[i] };
    });
    return values;
  },

  /**
   * Returns formatted data. Data accessors are applied, and string values are replaced.
   * @param {Array} dataset: the original domain
   * @param {Object} props: the props object
   * @param {Object} stringMap: a mapping of string values to numeric values
   * @returns {Array} the formatted data
   */
  formatData(dataset, props, stringMap) {
    const isArrayOrIterable = Array.isArray(dataset) || Immutable.isIterable(dataset);
    if (!isArrayOrIterable) {
      return [];
    }

    stringMap = stringMap || {
      x: this.createStringMap(props, "x"),
      y: this.createStringMap(props, "y")
    };

    const accessor = {
      x: Helpers.createAccessor(props.x !== undefined ? props.x : "x"),
      y: Helpers.createAccessor(props.y !== undefined ? props.y : "y"),
      y0: Helpers.createAccessor(props.y0 !== undefined ? props.y0 : "y0")
    };

    const data = dataset.reduce((dataArr, datum, index) => { // eslint-disable-line complexity
      const trimmedDatum = Array.isArray(datum) || Immutable.isList(datum)
        ? datum
        : this.trimDatum(datum, props);

      const evaluatedX = trimmedDatum._x !== undefined ? trimmedDatum._x : accessor.x(datum);
      const evaluatedY = trimmedDatum._y !== undefined ? trimmedDatum._y : accessor.y(datum);
      const y0 = trimmedDatum._y0 !== undefined ? trimmedDatum._y0 : accessor.y0(datum);
      const x = evaluatedX !== undefined ? evaluatedX : index;
      const y = evaluatedY !== undefined ? evaluatedY : trimmedDatum;
      const originalValues = y0 === undefined ? { x, y } : { x, y, y0 };
      const privateValues = y0 === undefined ? { _x: x, _y: y } : { _x: x, _y: y, _y0: y0 };

      dataArr.push(
        assign(
          originalValues, trimmedDatum, privateValues,
          // map string data to numeric values, and add names
          typeof x === "string" ? { _x: stringMap.x[x], xName: x } : {},
          typeof y === "string" ? { _y: stringMap.y[y], yName: y } : {},
          typeof y0 === "string" ? { _y0: stringMap.y[y0], yName: y0 } : {}
        )
      );

      return dataArr;
    }, []);

    const sortedData = this.sortData(data, props.sortKey, props.sortOrder);

    return this.cleanData(sortedData, props);
  },

  /**
   * Returns data point with only whitelisted props.
   * @param {Object} datum: the original data point
   * @param {Object} props: the props object
   * @returns {Object} the trimmed data point
   */
  trimDatum(datum, props) {
    const getter = Immutable.isImmutable(datum)
      ? (prop) => datum.get(prop)
      : (prop) => datum[prop];

    const trimmedDatum = this.datumWhitelist.reduce((finalProps, prop) => {
      const propValue = getter(prop);
      if (propValue !== undefined) {
        finalProps[prop] = propValue;
      }
      return finalProps;
    }, {});

    if (props.eventKey !== undefined) {
      trimmedDatum[props.eventKey] = getter(props.eventKey);
    }

    if (props.sortKey !== undefined) {
      trimmedDatum[props.sortKey] = getter(props.sortKey);
    }

    return trimmedDatum;
  },

  /**
   * Returns sorted data. If no sort keys are provided, data is returned unaltered.
   * Sort key should correspond to the `iteratees` argument in lodash `sortBy` function.
   * @param {Array} dataset: the original dataset
   * @param {mixed} sortKey: the sort key. Type is whatever lodash permits for `sortBy`
   * @param {String} sortOrder: the sort Order - `ascending` (default) or `descending`
   * @returns {Array} the sorted data
   */
  sortData(dataset, sortKey, sortOrder = "ascending") {
    if (!sortKey) {
      return dataset;
    }

    // Ensures previous VictoryLine api for sortKey prop stays consistent
    if (sortKey === "x" || sortKey === "y") {
      sortKey = `_${sortKey}`;
    }

    const sortedData = sortBy(dataset, sortKey);

    if (sortOrder === "descending") {
      return sortedData.reverse();
    }

    return sortedData;
  },

  /**
   * Returns the cleaned data. Some scale types break when certain data is supplied.
   * This method will remove data points that break certain scales. So far this method
   * only removes zeroes for log scales
   * @param {Array} dataset: the original domain
   * @param {Object} props: the props object
   * @returns {Array} the cleaned data
   */
  cleanData(dataset, props) {
    const scaleType = {
      x: Scale.getScaleType(props, "x"),
      y: Scale.getScaleType(props, "y")
    };
    if (scaleType.x !== "log" && scaleType.y !== "log") {
      return dataset;
    }
    const rules = (datum, axis) => {
      return scaleType[axis] === "log" ? datum[`_${axis}`] !== 0 : true;
    };
    return dataset.filter((datum) => {
      return rules(datum, "x") && rules(datum, "y") && rules(datum, "y0");
    });
  },

  // Returns a data accessor given an eventKey prop
  getEventKey(key) {
    // creates a data accessor function
    // given a property key, path, array index, or null for identity.
    if (isFunction(key)) {
      return key;
    } else if (key === null || typeof key === "undefined") {
      return () => undefined;
    }
    // otherwise, assume it is an array index, property key or path (_.property handles all three)
    return property(key);
  },

  // Returns data with an eventKey prop added to each datum
  addEventKeys(props, data) {
    const eventKeyAccessor = this.getEventKey(props.eventKey);
    return data.map((datum, index) => {
      const eventKey = datum.eventKey || eventKeyAccessor(datum) || index;
      return assign({ eventKey }, datum);
    });
  },

  /**
   * Returns an object mapping string data to numeric data
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Object} an object mapping string data to numeric data
   */
  createStringMap(props, axis) {
    const stringsFromAxes = this.getStringsFromAxes(props, axis);
    const stringsFromCategories = this.getStringsFromCategories(props, axis);
    const stringsFromData = this.getStringsFromData(props, axis);

    const allStrings = uniq([...stringsFromAxes, ...stringsFromCategories, ...stringsFromData]);
    return allStrings.length === 0 ? null :
      allStrings.reduce((memo, string, index) => {
        memo[string] = index + 1;
        return memo;
      }, {});
  },

  /**
   * Returns an array of strings from data
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Array} an array of strings
   */
  getStringsFromData(props, axis) {
    const isArrayOrIterable = Array.isArray(props.data) || Immutable.isIterable(props.data);
    if (!isArrayOrIterable) {
      return [];
    }
    const key = typeof props[axis] === "undefined" ? axis : props[axis];
    const accessor = Helpers.createAccessor(key);
    const dataStrings = (props.data)
        .map((datum) => accessor(datum))
        .filter((datum) => typeof datum === "string");
    // return a unique set of strings
    return dataStrings.reduce((prev, curr) => {
      if (typeof curr !== "undefined" && curr !== null && prev.indexOf(curr) === -1) {
        prev.push(curr);
      }
      return prev;
    }, []);
  },

  /**
   * Returns an array of strings from axis tickValues for a given axis
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Array} an array of strings
   */
  getStringsFromAxes(props, axis) {
    const { tickValues, tickFormat } = props;
    let tickValueArray;
    if (!tickValues || (!Array.isArray(tickValues) && !tickValues[axis])) {
      tickValueArray = tickFormat && Array.isArray(tickFormat) ? tickFormat : [];
    } else {
      tickValueArray = tickValues[axis] || tickValues;
    }
    return tickValueArray.filter((val) => typeof val === "string");
  },

  /**
   * Returns an array of strings from categories for a given axis
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Array} an array of strings
   */
  getStringsFromCategories(props, axis) {
    if (!props.categories) {
      return [];
    }
    const categories = this.getCategories(props, axis);
    const categoryStrings = categories && categories.filter((val) => typeof val === "string");
    return categoryStrings ? Collection.removeUndefined(categoryStrings) : [];
  },

  /**
   * Returns an array of categories for a given axis
   * @param {Object} props: the props object
   * @param {String} axis: the current axis
   * @returns {Array} an array of categories
   */
  getCategories(props, axis) {
    return props.categories && !Array.isArray(props.categories) ?
      props.categories[axis] : props.categories;
  },

  /**
   * Reduces the size of a data array, such that it is <= maxPoints.
   * @param {Array} data: an array of data; must be sorted
   * @param {Number} maxPoints: maximum number of data points to return
   * @param {Number} startingIndex: the index of the data[0] *in the entire dataset*; this function
                     assumes `data` param is a subset of larger dataset that has been zoommed
   * @returns {Array} an array of data, a subset of data param
   */
  downsample(data, maxPoints, startingIndex = 0) {
    // ensures that the downampling of data while zooming looks good.
    if (data.length > maxPoints) {
      // limit k to powers of 2, e.g. 64, 128, 256
      // so that the same points will be chosen reliably, reducing flicker on zoom
      const k = Math.pow(2, Math.ceil(Math.log2(data.length / maxPoints)));
      return data.filter(
        // ensure modulo is always calculated from same reference: i + startingIndex
        (d, i) => (((i + startingIndex) % k) === 0)
      );
    }
    return data;
  }
};
