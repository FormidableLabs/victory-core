/* eslint no-unused-expressions: 0 */
/* global sinon */
import { ContinuousTransitions } from "src/index";
import React from "react";

describe("getInitialTransitionState", () => {
  const makeChild = (data) => {
    return React.createElement("div", {data});
  };

  it("returns a 'falsey' transition object if children are not given", () => {
    const result = ContinuousTransitions.getInitialTransitionState(null, null);
    expect(result).to.eql({
      childrenTransitions: [],
      nodesWillExit: false,
      nodesWillEnter: false,
      nodesShouldExit: false
    });
  });

  it("it returns childTransitions entering and exiting false for identical data", () => {
    const child = makeChild([{x: 1, y: 1}, {x: 2, y: 3}]);
    const result = ContinuousTransitions.getInitialTransitionState(child, child);
    expect(result).to.eql({
      childrenTransitions: [{entering: false, exiting: false}],
      nodesWillExit: false,
      nodesWillEnter: false,
      nodesShouldExit: false
    });
  });

  it("it returns childTransitions with exiting data", () => {
    const child1 = makeChild([{x: 1, y: 1}, {x: 2, y: 3}]);
    const child2 = makeChild([{x: 1, y: 1}]);
    const result = ContinuousTransitions.getInitialTransitionState(child1, child2);
    expect(result).to.eql({
      childrenTransitions: [{entering: false, exiting: {1: true}}],
      nodesWillExit: true,
      nodesWillEnter: false,
      nodesShouldExit: false
    });
  });

  it("it returns childTransitions with entering data", () => {
    const child1 = makeChild([{x: 1, y: 1}]);
    const child2 = makeChild([{x: 1, y: 1}, {x: 2, y: 3}]);
    const result = ContinuousTransitions.getInitialTransitionState(child1, child2);
    expect(result).to.eql({
      childrenTransitions: [{entering: {1: true}, exiting: false}],
      nodesWillExit: false,
      nodesWillEnter: true,
      nodesShouldExit: false
    });
  });
});

describe("getTransitionPropsFactory", () => {
  const toZero = sinon.spy(() => ({y: 0}));
  const makeChild = (data) => {
    return {
      type: {
        defaultTransitions: {
          onExit: {duration: 1, before: toZero },
          onEnter: {duration: 2, before: toZero }
        }
      },
      props: {data, animate: {duration: 0}}
    };
  };

  const callback = sinon.stub();

  it("returns a function that describes data exiting", () => {
    const exitingState = {
      childrenTransitions: [{entering: false, exiting: {1: true}}],
      nodesWillExit: true,
      nodesWillEnter: false,
      nodesShouldExit: false
    };
    const result = ContinuousTransitions.getTransitionPropsFactory({}, exitingState, callback);
    const child = makeChild([{x: 1, y: 1}, {x: 2, y: 3}]);
    const calledResult = result(child);
    expect(result).to.be.a("function");
    expect(calledResult).to.have.keys(["animate", "data"]);
    expect(toZero).calledWith({x: 2, y: 3});
    expect(calledResult.data).to.eql([{x: 1, y: 1}, {x: 2, y: 0}]);
  });

  it("returns a function that describes data entering", () => {
    const enteringState = {
      childrenTransitions: [{entering: {1: true}, exiting: false}],
      nodesWillExit: false,
      nodesWillEnter: true,
      nodesShouldExit: false
    };
    const result = ContinuousTransitions.getTransitionPropsFactory({}, enteringState, callback);
    const child = makeChild([{x: 1, y: 1}, {x: 2, y: 3}]);
    const calledResult = result(child);
    expect(result).to.be.a("function");
    expect(calledResult).to.have.keys(["animate", "data"]);
    expect(toZero).calledWith({x: 2, y: 3});
    expect(calledResult.data).to.eql([{x: 1, y: 1}, {x: 2, y: 0}]);
    expect(calledResult.animate.duration).to.equal(child.type.defaultTransitions.onEnter.duration);
  });

});