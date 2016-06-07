VictoryCore Changelog
=====================
## 3.0.0 (2016-06-01) 

- Adds `VictorySharedEvents` wrapper for coordinating events between supported Victory Components. An annotated example of the new events API:

```
<VictorySharedEvents
  events={[
    {
      childName: "firstBar", // if a child name is not provided, event will be attached to all children. 
      target: "data", // what type of element to attach to. Matches the style namespaces
      eventKey: 1, // What event key of element to attach to. Defaults to the index in data. 
      eventHandlers: {
        onClick: () => {
          return {
            childName: "secondBar", // the child to be modified
            // props here are the props that define the targeted component i.e. what is passed to an individual bar
            mutation: (props) => { 
              return {style: merge({}, props.style, {fill: "blue"})}; // Whatever is returned here will override the existing props
            }
          };
        }
      }
    }, {
      childName: "secondBar",
      target: "data",
      eventKey: 0,
      eventHandlers: {
        onClick: () => { // event handlers can return an array of mutation objects with different targeted elements
          return [
            {
              childName: "firstBar",
              mutation: (props) => {
                return {style: merge({}, props.style, {fill: "cyan"})};
              }
            }, {
              mutation: (props) => { // the default target element is whatever element the handler is attached to
                return {style: merge({}, props.style, {fill: "orange"})};
              }
            }, {
              target: "labels",
              eventKey: 1,
              mutation: () => {
                return {text: "CLICKED"};
              }
            }
          ];
        }
      }
    }
  ]}
>
  <VictoryBar
    name="firstBar" // if children don't have name props they can be referenced by index in shared events
    style={{
      data: {width: 25, fill: "gold"}
    }}
    data={[{x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 4}]}
  />
  <VictoryBar
    name="secondBar"
    data={[{x: "a", y: 2}, {x: "b", y: 3}, {x: "c", y: 4}]}
  />
</VictorySharedEvents>
```

## 2.1.0 (2016-05-26)

- Upgrades to React 15
- Alters transitions to support wrapped components

## 2.0.1 (2016-05-13)

- Uses `.js` file extension rather than `.jsx`.
- Updates import syntax for `lodash`

## 2.0.0 (2016-05-05)

- Changes how events are stored on state to facilitate interactions between elements
- This is a breaking change, as it will require the namespace to be returned with any other props from the event handler like so:
```
events: {
 data: {
  onClick: () => {
   return { data: { style: {fill: "red"} }, labels: { style: {fill: "black"} } };  
  }
 }
}
```

## 1.4.0 (2016-04-14)

- Adds a VictoryTransition wrapper to facilitate enter and exit transitions for any components with an array `data` prop.
- Supports coordinating transitions for deeply nested children (i.e. stacked bar charts)
- Modifies array interpolation so that the interpolated array is never longer than the end array. See https://github.com/d3/d3-interpolate/pull/19

## 1.3.0 (2016-03-28)

- Adds initial enter and exit transition support
- Adds a `labelAngle` prop to VictoryLabel
- Improves transformations

## 1.2.1 (2016-03-15)

- Upgrades to builder 2.9.1 for lodash 4 support

## 1.2.0 (2016-03-11)

- Adds event helper methods
- Adds an events prop to VictoryLabel
- Updates to Babel 6
- Updates to Lodash 4

## 1.1.0 (2016-03-02)

- Add matchDataLength custom proptype

## 1.0.0 (2016-03-01)

- Merge `victory-label@1.0.1`, `victory-util@5.0.0`, `victory-animation@0.1.0` to `victory-core`
- Don't publish source maps to npm or git
- Don't publish `docs/build` directory to npm
- Add `npm start` and `npm test` scripts

### VictoryLabel

- Add support for providing label text as a prop

### VictoryAnimation

- 	Retire `velocity` in favor of `duration` in milliseconds.

Deprecated Subcomponents
========================

Below are the histories of individual subcomponents before they were merged into `victory-core`.

## VictoryLabel

### 1.0.1

- Update victory-util version
- Fix README title
- Use minified file path for gzip size badge

### 1.0.0 (2016-01-29)

- Update `victory-util` for victory archetype bump.
- Remove react peerDependency

### 0.3.1 (2016-01-29)

Update `victory-util` for data accessor feature bump

### 0.3.0 (2016-01-29)

- Update builder and victory archetypes.
- Move lodash and radium dependencies from the archetype to the package

### 0.2.0 (2016-1-26)

Refactor to use shared methods from `victory-util`

### 0.1.9 Alpha (2015-12-17)

We make no promises about any code prior to this release.


## VictoryUtil

### 5.0.0
- 	Remove chart specific methods, consolidate others

### 4.0.0 (2016-01-29)
- Application dependencies like `lodash` now live in components, not in the Builder archetype. This is a breaking change. https://github.com/FormidableLabs/victory/issues/176

### 3.0.0 (2016-01-29)

- Supports data accessor functions!
[more detail](https://github.com/FormidableLabs/victory/issues/84)

Data
 - `Data.consolidateData(props)` -> `Data.formatDatasets(props)`
 - `Data.createAccessor(key)`

PropTypes
  - `integer`
  - `allOfType` - runs a given prop through an array of validators

### 2.1.0 (2016-1-15)

This tag adds shared methods to VictoryUtil to reduce code repetition in all of the chart ecosystem components (VictoryChart, VictoryBar, VictoryAxis, VictoryLine, VictoryScatter)

Public methods added:

Scale
  - `Scale.getBaseScale(props, axis)`
  - `Scale.getScaleType(props, axis)`
  - `Scale.getScaleFromProps(props, axis)`
  - `Scale.getScaleTypeFromData(props, axis)`

This collection of methods:
  - replaces the `getScale` methods that were used in the chart ecosystem repos
  - adds scale type checking via duck typing d3 scale methods
  - adds support for passing in the scale type as a string _i.e._` "linear"` instead of `d3Scale.linear()`

Domain
  - `Domain.getDomain(props, axis)`
  - `Domain.getDomainFromProps(props, axis)`
  - `Domain.getDomainFromData(dataset, axis)`
  - `Domain.padDomain(domain, props, axis)`

This collection of methods:
- replaces the `getDomain` method in single data series components (VictoryScatter, VictoryLine)
- Adds domain helpers for the more complicated components

Data
 - `Data.getData(props)`
 - `Data.consolidateData(props)`
 - `Data.createStringMap(props, axis)`
 - `Data.getStringsFromCategories(props, axis)`
 - `Data.getStringsFromAxes(props, axis)`
 - `Data.getStringsFromData(props, axis)`
 - `Data.getStringsFromXY(props, axis)`

This collection of methods:
- replaces the `getData` method in single data series components (VictoryScatter, VictoryLine)
- replaces the `consolidateData` method in multi-series data components (VictoryBar)
- replaces the `createStringMap` method for components
- adds string helpers for creating a shared stringMap in VictoryChart

Chart
 - `getPadding(props)`
 - `getRange(props, axis)`
 - `getStyles(props, defaultStyles)`
 - `evaluateProp(prop, data)`
 - `evaluateStyle(style, data)`

This collection of methods:
 - replaces `getRange` and `getPadding` methods across all chart ecosystem components
 - replaces `getStyle` method in components that take style objects in the following form
```
style={{
  parent: {...},
  data: {...},
  labels: {...}
}}
```
- replaces functional style and functional prop support methods `evaluateProp` and  `evaluateStyle` across all chart components

### 2.0.3 Alpha (2015-12-16)

We make no promises about any code prior to this release.
