/**
 * Client tests
 */
import React from "react";
import { shallow, render } from "enzyme";
import VictoryLegend from "src/victory-legend/victory-legend";

const initialData = [{
  name: "Series 1",
  symbol: {
    type: "circle"
  }
}, {
  name: "Series 2",
  labels: {
    fill: "red"
  },
  symbol: {
    type: "triangleUp",
    fill: "blue"
  }
}];

describe("components/victory-legend", () => {
  let wrapper = shallow(<VictoryLegend data={initialData} />);

  it("has expected content with shallow render", () => {
    const output = wrapper.find("VictoryLabel");
    expect(output.length).to.equal(2);
  });

  it("has expected horizontal symbol position", () => {
    const wrappedLegend = shallow(<VictoryLegend data={initialData} orientation="horizontal" />);
    const output = wrappedLegend.find("Point");

    expect(output.at(0).prop("x")).to.equal(7);
    expect(output.at(1).prop("x")).to.equal(95.68016194331983);
    expect(output.at(0).prop("y")).to.equal(7);
    expect(output.at(1).prop("y")).to.equal(7);
  });

  it("has expected vertical symbol position", () => {
    const wrappedLegend = shallow(<VictoryLegend data={initialData} orientation="vertical" />);
    const output = wrappedLegend.find("Point");

    expect(output.at(0).prop("x")).to.equal(7);
    expect(output.at(1).prop("x")).to.equal(7);
    expect(output.at(0).prop("y")).to.equal(7);
    expect(output.at(1).prop("y")).to.equal(31);
  });

  it("has expected horizontal legend labels position", () => {
    const wrappedLegend = render(<VictoryLegend data={initialData} orientation="horizontal" />);
    const output = wrappedLegend.find("text");

    expect(output.eq(0).prop("x")).to.equal("22");
    expect(output.eq(1).prop("x")).to.equal("110.68016194331983");
    expect(output.eq(0).prop("y")).to.equal("7");
    expect(output.eq(1).prop("y")).to.equal("7");
  });

  it("has expected vertical legend labels position", () => {
    const wrappedLegend = render(<VictoryLegend data={initialData} orientation="vertical" />);
    const output = wrappedLegend.find("text");

    expect(output.eq(0).prop("x")).to.equal("22");
    expect(output.eq(1).prop("x")).to.equal("22");
    expect(output.eq(0).prop("y")).to.equal("7");
    expect(output.eq(1).prop("y")).to.equal("31");
  });

  describe("symbols", () => {
    const legendData = [{
      name: "Series 1",
      labels: {
        fontSize: 10
      },
      symbol: {
        type: "circle",
        fill: "red"
      }
    }, {
      name: "Long Series Name",
      labels: {
        fontSize: 12
      },
      symbol: {
        type: "triangleUp",
        fill: "blue"
      }
    }];

    wrapper = shallow(<VictoryLegend data={legendData} />);
    const output = wrapper.find("Point");

    it("has expected symbols length", () => {
      expect(output.length).to.equal(2);
    });

    it("has expected symbol colors", () => {
      expect(output.get(0).props.style.fill).to.equal("red");
      expect(output.get(1).props.style.fill).to.equal("blue");
    });

    it("has expected symbol type", () => {
      expect(output.get(0).props.symbol).to.equal("circle");
      expect(output.get(1).props.symbol).to.equal("triangleUp");
    });
  });

  describe("legend style prop", () => {
    const legendData = [{
      name: "Thing 1"
    }, {
      name: "Thing 2"
    }];

    const styleObject = {
      data: {
        type: "triangleUp",
        fill: "green"
      },
      labels: {
        fontSize: 16
      }
    };

    wrapper = shallow(<VictoryLegend data={legendData} style={styleObject} />);
    const outputPoints = wrapper.find("Point");
    const outputLabels = wrapper.find("VictoryLabel");

    it("has expected symbol type", () => {
      expect(outputPoints.at(0).prop("symbol")).to.equal("triangleUp");
      expect(outputPoints.at(1).prop("symbol")).to.equal("triangleUp");
    });

    it("has expected symbol colors", () => {
      expect(outputPoints.get(0).props.style.fill).to.equal("green");
      expect(outputPoints.get(1).props.style.fill).to.equal("green");
    });

    it("has expected label colors", () => {
      expect(outputLabels.get(0).props.style.fill).to.equal("#252525");
      expect(outputLabels.get(1).props.style.fill).to.equal("#252525");
    });
  });

  describe("itemsPerRow", () => {
    const legendData = [{
      name: "Thing 1"
    }, {
      name: "Thing 2"
    }, {
      name: "Thing 3"
    }, {
      name: "Thing 4"
    }, {
      name: "Thing 5"
    }, {
      name: "Thing 6"
    }];

    it("displays items in columns", () => {
      wrapper = shallow(<VictoryLegend data={legendData} itemsPerRow={3} />);
      const outputLabels = wrapper.find("VictoryLabel");
      const outputPoints = wrapper.find("Point");

      // items line up between columns
      expect(outputPoints.get(0).props.y).to.equal(outputPoints.get(3).props.y);
      expect(outputLabels.get(0).props.y).to.equal(outputLabels.get(3).props.y);
      expect(outputPoints.get(1).props.y).to.equal(outputPoints.get(4).props.y);
      expect(outputLabels.get(1).props.y).to.equal(outputLabels.get(4).props.y);
      expect(outputPoints.get(2).props.y).to.equal(outputPoints.get(5).props.y);
      expect(outputLabels.get(2).props.y).to.equal(outputLabels.get(2).props.y);

      // columns are the same distance apart
      expect(outputPoints.get(0).props.x - outputPoints.get(3).props.x)
        .to.equal(outputPoints.get(1).props.x - outputPoints.get(4).props.x).and
        .to.equal(outputPoints.get(2).props.x - outputPoints.get(5).props.x);
    });

    it("displays items in rows", () => {
      wrapper = shallow(
        <VictoryLegend
          data={legendData}
          itemsPerRow={3}
          orientation="horizontal"
        />
      );
      const outputLabels = wrapper.find("VictoryLabel");
      const outputPoints = wrapper.find("Point");

      // items line up between rows
      expect(outputPoints.get(0).props.x).to.equal(outputPoints.get(3).props.x);
      expect(outputLabels.get(0).props.x).to.equal(outputLabels.get(3).props.x);
      expect(outputPoints.get(1).props.x).to.equal(outputPoints.get(4).props.x);
      expect(outputLabels.get(1).props.x).to.equal(outputLabels.get(4).props.x);
      expect(outputPoints.get(2).props.x).to.equal(outputPoints.get(5).props.x);
      expect(outputLabels.get(2).props.x).to.equal(outputLabels.get(2).props.x);

      // rows are the same distance apart
      expect(outputPoints.get(0).props.y - outputPoints.get(3).props.y)
        .to.equal(outputPoints.get(1).props.y - outputPoints.get(4).props.y).and
        .to.equal(outputPoints.get(2).props.y - outputPoints.get(5).props.y);
    });
  });
});

const LegendGroupTest = (props) => {
  const { width, height } = props; // eslint-disable-line react/prop-types
  expect(width).to.be.above(0);
  expect(height).to.be.above(0);
  return <div />;
};

describe("groupComponent", () => {
  const legendData = [{
    name: "Series 1",
    labels: {
      fontSize: 10
    },
    symbol: {
      type: "circle",
      fill: "red"
    }
  }, {
    name: "Long Series Name",
    labels: {
      fontSize: 12
    },
    symbol: {
      type: "triangleUp",
      fill: "blue"
    }
  }];

  it("has width and height values set", () => {
    render(
      <VictoryLegend
        data={legendData}
        standalone={false}
        groupComponent={<LegendGroupTest />}
      />
    );
  });
});
