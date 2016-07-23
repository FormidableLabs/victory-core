/**
 * Client tests
 */
import React from "react";
import { mount } from "enzyme";
import VictoryContinuousTransition from "src/victory-transition/victory-continuous-transition";

const TestComponent = React.createClass({
  propTypes: {
    message: React.PropTypes.array
  },

  render() {
    return (
      <text className="foo">
        {this.props.message[0]}
      </text>
    );
  }
});

describe("components/victory-continous-transition", () => {
  it("renders a child component", () => {
    const wrapper = mount(
      <VictoryContinuousTransition animate={{duration: 0}} animationWhitelist={["data"]}>
        <TestComponent animate={{duration: 0}} message={["HELLO"]} />
      </VictoryContinuousTransition>
    );
    const output = wrapper.find(".foo");
    expect(output.length).to.equal(1);
    expect(output.text()).to.equal("HELLO");
  });
});
