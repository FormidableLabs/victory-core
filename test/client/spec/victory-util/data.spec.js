/* eslint no-unused-expressions: 0, max-nested-callbacks: 0 */
/* global sinon */

import { Data } from "src/index";
import { fromJS } from "immutable";

const immutableDataTest = {
  createDataObj: (data) => fromJS(data),
  readDataObj: (data) => data.toJS(),
  testLabel: "helpers/data for immutable"
};

const dataTest = {
  createDataObj: (data) => data,
  readDataObj: (data) => data,
  testLabel: "helpers/data"
};

[dataTest, immutableDataTest].forEach(({ createDataObj, readDataObj, testLabel }) => {
  describe(`${testLabel}`, () => {
    describe("createStringMap", () => {
      let sandbox;
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.spy(Data, "getStringsFromAxes");
        sandbox.spy(Data, "getStringsFromCategories");
        sandbox.spy(Data, "getStringsFromData");
      });
      afterEach(() => {
        sandbox.restore();
      });

      const tickValues = ["one", "two", "three"];
      const categories = ["red", "green", "blue"];
      const data = createDataObj([{ x: "one", y: 1 }, { x: "red", y: 2 }, { x: "cat", y: 3 }]);

      it("returns a string map from strings in tickValues", () => {
        const props = { tickValues };
        const stringMap = Data.createStringMap(props, "x");
        expect(Data.getStringsFromAxes).calledWith(props, "x");
        expect(Data.getStringsFromAxes).to.have.returned(["one", "two", "three"]);
        expect(stringMap).to.eql({ one: 1, two: 2, three: 3 });
      });

      it("returns a string map from strings in categories", () => {
        const props = { categories };
        const stringMap = Data.createStringMap(props, "x");
        expect(Data.getStringsFromCategories).calledWith(props, "x");
        expect(Data.getStringsFromCategories).to.have.returned(["red", "green", "blue"]);
        expect(stringMap).to.eql({ red: 1, green: 2, blue: 3 });
      });

      it("returns a string map from strings in data", () => {
        const props = { data };
        const stringMap = Data.createStringMap(props, "x");
        expect(Data.getStringsFromData).calledWith(props, "x");
        expect(Data.getStringsFromData).to.have.returned(["one", "red", "cat"]);
        expect(stringMap).to.eql({ one: 1, red: 2, cat: 3 });
      });

      it("a unique set of values is returned from multiple sources", () => {
        const props = { tickValues, data };
        const stringMap = Data.createStringMap(props, "x");
        expect(Data.getStringsFromAxes).to.have.returned(["one", "two", "three"]);
        expect(Data.getStringsFromData).to.have.returned(["one", "red", "cat"]);
        expect(stringMap).to.eql({ one: 1, two: 2, three: 3, red: 4, cat: 5 });
      });
    });

    describe("getStringsFromData", () => {
      it("returns an array of strings from a data prop", () => {
        const props = {
          data: createDataObj([
            { x: "one", y: 1 },
            { x: "red", y: 2 },
            { x: "cat", y: 3 }
          ])
        };
        const dataStrings = Data.getStringsFromData(props, "x");
        expect(dataStrings).to.eql(["one", "red", "cat"]);
      });

      it("returns an array of strings from array-type data", () => {
        const props = { data: createDataObj([["one", 1], ["red", 2], ["cat", 3]]), x: 0, y: 1 };
        const dataStrings = Data.getStringsFromData(props, "x");
        expect(dataStrings).to.eql(["one", "red", "cat"]);
      });

      it("only returns strings, if data is mixed", () => {
        const props = { data: createDataObj([{ x: 1, y: 1 }, { x: "three", y: 3 }]) };
        expect(Data.getStringsFromData(props, "x")).to.eql(["three"]);
      });

      it("returns an empty array when no strings are present", () => {
        const props = { data: createDataObj([{ x: 1, y: 1 }, { x: 3, y: 3 }]) };
        expect(Data.getStringsFromData(props, "x")).to.eql([]);
      });

      it("returns an empty array when the data prop is undefined", () => {
        expect(Data.getStringsFromData({}, "x")).to.eql([]);
      });
    });

    describe("getStringsFromAxes", () => {
      it("returns an array of strings when tickValues is an array", () => {
        const props = { tickValues: [1, "three", 5] };
        expect(Data.getStringsFromAxes(props, "x")).to.eql(["three"]);
      });

      it("returns an array of strings when tickValues is an object", () => {
        const props = { tickValues: { x: [1, "three", 5] } };
        expect(Data.getStringsFromAxes(props, "x")).to.eql(["three"]);
      });

      it("returns an empty array when a given axis is not defined", () => {
        const props = { tickValues: { y: [1, "three", 5] } };
        expect(Data.getStringsFromAxes(props, "x")).to.eql([]);
      });

      it("returns an empty array when no strings are present", () => {
        const props = { tickValues: [1, 3, 5] };
        expect(Data.getStringsFromAxes(props, "x")).to.eql([]);
      });

      it("returns an empty array when the tickValues prop is undefined", () => {
        expect(Data.getStringsFromAxes({}, "x")).to.eql([]);
      });
    });

    describe("getStringsFromCategories", () => {
      it("returns an empty array when no strings are present", () => {
        const props = { categories: [1, 3, 5] };
        expect(Data.getStringsFromCategories(props, "x")).to.eql([]);
      });

      it("returns an empty array when the category prop is undefined", () => {
        expect(Data.getStringsFromCategories({}, "x")).to.eql([]);
      });
    });

    describe("formatData", () => {
      let sandbox;
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.spy(Data, "cleanData");
      });

      afterEach(() => {
        sandbox.restore();
      });

      it("formats a single dataset", () => {
        const dataset = createDataObj([{ _x: 1, _y: 3, x: 1, y: 3 }, { _x: 2, _y: 5, x: 2, y: 5 }]);
        const props = { data: dataset };
        const formatted = Data.formatData(dataset, props);
        expect(Data.cleanData).called.and.returned(readDataObj(dataset));
        expect(formatted).to.be.an.array;
        expect(formatted[0]).to.have.keys(["_x", "_y", "x", "y"]);
      });
    });

    describe("getData", () => {
      let sandbox;
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.spy(Data, "formatData");
        sandbox.spy(Data, "generateData");
        sandbox.spy(Data, "addEventKeys");
      });

      afterEach(() => {
        sandbox.restore();
      });

      it("formats and returns the data prop", () => {
        const data = createDataObj([{ x: "kittens", y: 3 }, { x: "cats", y: 5 }]);
        const props = { data, x: "x", y: "y" };
        const expectedReturn = [
          { _x: 1, x: "kittens", xName: "kittens", _y: 3, y: 3 },
          { _x: 2, x: "cats", xName: "cats", _y: 5, y: 5 }
        ];
        const expectedReturnWithEventKeys = [
           { _x: 1, x: "kittens", xName: "kittens", _y: 3, y: 3, eventKey: 0 },
           { _x: 2, x: "cats", xName: "cats", _y: 5, y: 5, eventKey: 1 }
        ];
        const returnData = Data.getData(props);
        expect(Data.formatData).calledOnce.and.returned(expectedReturn);
        expect(Data.addEventKeys).calledOnce.and.returned(expectedReturnWithEventKeys);
        expect(returnData).to.eql(expectedReturnWithEventKeys);
      });

      it("uses the event key when it is passed in", () => {
        const data = createDataObj([
          { x: 2, y: 2, eventKey: 13 },
          { x: 1, y: 3, eventKey: 21 },
          { x: 3, y: 1, eventKey: 11 }
        ]);

        const returnData = Data.getData({ data });

        expect(returnData).to.eql([
          { _x: 2, x: 2, _y: 2, y: 2, eventKey: 13 },
          { _x: 1, x: 1, _y: 3, y: 3, eventKey: 21 },
          { _x: 3, x: 3, _y: 1, y: 1, eventKey: 11 }
        ]);
      });

      it("uses a custom event key when it is passed in", () => {
        const data = createDataObj([
          { x: 2, y: 2, myEventKey: 3 },
          { x: 1, y: 3, myEventKey: 2 },
          { x: 3, y: 1, myEventKey: 1 }
        ]);

        const returnData = Data.getData({ data, eventKey: "myEventKey" });

        expect(returnData).to.eql([
          { _x: 2, x: 2, _y: 2, y: 2, eventKey: 3, myEventKey: 3 },
          { _x: 1, x: 1, _y: 3, y: 3, eventKey: 2, myEventKey: 2 },
          { _x: 3, x: 3, _y: 1, y: 1, eventKey: 1, myEventKey: 1 }
        ]);
      });

      it("does not sort data when sort key not passed", () => {
        const data = createDataObj([{ x: 2, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 1 }]);

        const returnData = Data.getData({ data });

        expect(returnData).to.eql([
          { _x: 2, x: 2, _y: 2, y: 2, eventKey: 0 },
          { _x: 1, x: 1, _y: 3, y: 3, eventKey: 1 },
          { _x: 3, x: 3, _y: 1, y: 1, eventKey: 2 }
        ]);
      });

      it("sorts data according to sort key", () => {
        const data = createDataObj([
          { x: 1, y: 1, order: 2 },
          { x: 3, y: 3, order: 1 },
          { x: 2, y: 2, order: 3 }
        ]);

        const returnData = Data.getData({ data, sortKey: "order" });

        expect(returnData).to.eql([
          { _x: 3, x: 3, _y: 3, y: 3, order: 1, eventKey: 0 },
          { _x: 1, x: 1, _y: 1, y: 1, order: 2, eventKey: 1 },
          { _x: 2, x: 2, _y: 2, y: 2, order: 3, eventKey: 2 }
        ]);
      });

      it("sorts data according to sort key and sort order", () => {
        const data = createDataObj([
          { x: 1, y: 1, order: 2 },
          { x: 3, y: 3, order: 1 },
          { x: 2, y: 2, order: 3 }
        ]);

        const returnData = Data.getData({ data, sortKey: "order", sortOrder: "descending" });

        expect(returnData).to.eql([
          { _x: 2, x: 2, _y: 2, y: 2, order: 3, eventKey: 0 },
          { _x: 1, x: 1, _y: 1, y: 1, order: 2, eventKey: 1 },
          { _x: 3, x: 3, _y: 3, y: 3, order: 1, eventKey: 2 }

        ]);
      });

      // Ensures previous VictoryLine api for sortKey prop stays consistent
      it("sorts data according to evaluated sort key when sort key is x or y", () => {
        const data = createDataObj([
          { _x: 2, x: 10, _y: 2, y: 10 },
          { _x: 1, x: 20, _y: 3, y: 20 },
          { _x: 3, x: 30, _y: 1, y: 30 }
        ]);

        const returnDataX = Data.getData({ data, sortKey: "x" });

        expect(returnDataX).to.eql([
          { _x: 1, x: 20, _y: 3, y: 20, eventKey: 0 },
          { _x: 2, x: 10, _y: 2, y: 10, eventKey: 1 },
          { _x: 3, x: 30, _y: 1, y: 30, eventKey: 2 }
        ]);

        const returnDataY = Data.getData({ data, sortKey: "y" });

        expect(returnDataY).to.eql([
          { _x: 3, x: 30, _y: 1, y: 30, eventKey: 0 },
          { _x: 2, x: 10, _y: 2, y: 10, eventKey: 1 },
          { _x: 1, x: 20, _y: 3, y: 20, eventKey: 2 }
        ]);
      });

      it("generates a dataset from domain", () => {
        const generatedReturn = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
        const expectedReturn = [{ _x: 0, x: 0, _y: 0, y: 0 }, { _x: 10, x: 10, _y: 10, y: 10 }];
        const expectedReturnWithEventKeys = [
          { _x: 0, x: 0, _y: 0, y: 0, eventKey: 0 }, { _x: 10, x: 10, _y: 10, y: 10, eventKey: 1 }
        ];
        const props = { x: "x", y: "y", domain: { x: [0, 10], y: [0, 10] } };
        const returnData = Data.getData(props);
        expect(Data.generateData).calledOnce.and.returned(generatedReturn);
        expect(Data.formatData).calledOnce.and.returned(expectedReturn);
        expect(Data.addEventKeys).calledOnce.and.returned(expectedReturnWithEventKeys);
        expect(returnData).to.eql(expectedReturnWithEventKeys);
      });

      it("generates a dataset from domain and samples", () => {
        const generatedReturn = [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }];
        const expectedReturn = [
          { _x: 0, x: 0, _y: 0, y: 0 },
          { _x: 5, x: 5, _y: 5, y: 5 },
          { _x: 10, x: 10, _y: 10, y: 10 }
        ];
        const expectedReturnWithEventKeys = [
          { _x: 0, x: 0, _y: 0, y: 0, eventKey: 0 },
          { _x: 5, x: 5, _y: 5, y: 5, eventKey: 1 },
          { _x: 10, x: 10, _y: 10, y: 10, eventKey: 2 }
        ];
        const props = { x: "x", y: "y", domain: { x: [0, 10], y: [0, 10] }, samples: 2 };
        const returnData = Data.getData(props);
        expect(Data.generateData).calledOnce.and.returned(generatedReturn);
        expect(Data.formatData).calledOnce.and.returned(expectedReturn);
        expect(Data.addEventKeys).calledOnce.and.returned(expectedReturnWithEventKeys);
        expect(returnData).to.eql(expectedReturnWithEventKeys);
      });
    });
  });
});
