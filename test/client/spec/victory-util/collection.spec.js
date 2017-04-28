import { Collection } from "src/index";

describe("collections", () => {

  describe("isNonEmptyArray", () => {

    it("returns false for undefined argument", () => {
      expect(Collection.isNonEmptyArray()).to.equal(false);
    });

    it("returns false for empty array", () => {
      expect(Collection.isNonEmptyArray([])).to.equal(false);
    });

    it("returns true for non-empty array", () => {
      expect(Collection.isNonEmptyArray(["hello"])).to.equal(true);
    });
  });

  describe("containsStrings", () => {

    it("handles empty argument", () => {
      expect(Collection.containsStrings()).to.equal(false);
    });

    it("handles empty array", () => {
      expect(Collection.containsStrings([])).to.equal(false);
    });

    it("returns false for collections of non-strings", () => {
      expect(Collection.containsStrings([0, 1])).to.equal(false);
      expect(Collection.containsStrings([undefined, null, NaN])).to.equal(false);
      expect(Collection.containsStrings([{}, { a: "foo" }])).to.equal(false);
    });

    it("returns false for collections with strings", () => {
      expect(Collection.containsStrings(["hello"])).to.equal(true);
      expect(Collection.containsStrings(["hello", "there"])).to.equal(true);
      expect(Collection.containsStrings([0, "hello", {}, null])).to.equal(true);
    });
  });

  describe("containsOnlyStrings", () => {

    it("handles empty argument", () => {
      expect(Collection.containsOnlyStrings()).to.equal(false);
    });

    it("handles empty array", () => {
      expect(Collection.containsOnlyStrings([])).to.equal(false);
    });

    it("returns false for collections of non-strings", () => {
      expect(Collection.containsOnlyStrings([0, 1])).to.equal(false);
      expect(Collection.containsOnlyStrings([undefined, null, NaN])).to.equal(false);
      expect(Collection.containsOnlyStrings([{}, { a: "foo" }])).to.equal(false);
    });

    it("returns false for collections with some strings", () => {
      expect(Collection.containsOnlyStrings(["hello", 0])).to.equal(false);
      expect(Collection.containsOnlyStrings(["hello", ["not me"]])).to.equal(false);
      expect(Collection.containsOnlyStrings([0, "hello", {}, null])).to.equal(false);
    });

    it("returns true for collections with only strings", () => {
      expect(Collection.containsOnlyStrings(["hello"])).to.equal(true);
      expect(Collection.containsOnlyStrings(["hello", "there"])).to.equal(true);
    });
  });

  describe("isArrayOfArrays", () => {

    it("handles empty argument", () => {
      expect(Collection.isArrayOfArrays()).to.equal(false);
    });

    it("handles empty array", () => {
      expect(Collection.isArrayOfArrays([])).to.equal(false);
    });

    it("returns false for collections of non-arrays", () => {
      expect(Collection.isArrayOfArrays([1])).to.equal(false);
      expect(Collection.isArrayOfArrays([{}])).to.equal(false);
      expect(Collection.isArrayOfArrays(["a"])).to.equal(false);
    });

    it("returns false for mixed collections", () => {
      expect(Collection.isArrayOfArrays([[], 1, {}])).to.equal(false);
      expect(Collection.isArrayOfArrays([1, [], {}])).to.equal(false);
      expect(Collection.isArrayOfArrays([1, {}, []])).to.equal(false);
    });

    it("returns true for collections of arrays", () => {
      expect(Collection.isArrayOfArrays([ [] ])).to.equal(true);
      expect(Collection.isArrayOfArrays([ [{}] ])).to.equal(true);
      expect(Collection.isArrayOfArrays([ [ [] ] ])).to.equal(true);
      expect(Collection.isArrayOfArrays([ [], [] ])).to.equal(true);
    });
  });

  describe("removeUndefined", () => {

    it("handles empty array", () => {
      expect(Collection.removeUndefined([])).to.eql([]);
    });

    it("does not filter non-undefineds", () => {
      const testArray = [0, 1, "a", {}, false, null, NaN];
      expect(Collection.removeUndefined(testArray)).to.eql(testArray);
    });

    it("filters out undefineds", () => {
      const testArray = [undefined, 0, undefined, {}, false, null, NaN, undefined];
      const expectedArray = [0, {}, false, null, NaN];
      expect(Collection.removeUndefined(testArray)).to.eql(expectedArray);
    });
  });

  describe("getMaxValue", () => {

    it("returns a date if array contains dates", () => {
      const array = [new Date(2016, 3, 6), new Date(2017, 5, 3), 10];
      expect(Collection.getMaxValue(array)).to.eql(new Date(2017, 5, 3));
    });

    it("returns a number if array does not contain dates", () => {
      const array = [3, 8, 10];
      expect(Collection.getMaxValue(array)).to.eql(10);
    });

    it("allows values to be concated and returns the appropriate number", () => {
      const array = [3, 8, 10];
      expect(Collection.getMaxValue(array, 1, 20)).to.eql(20);
    });
  });

  describe("getMinValue", () => {

    it("returns a date if array contains dates", () => {
      const array = [new Date(2016, 3, 6), new Date(2017, 5, 3), new Date(2015, 11, 4)];
      expect(Collection.getMinValue(array)).to.eql(new Date(2015, 11, 4));
    });

    it("returns a number if array does not contain dates", () => {
      const array = [3, 8, 10];
      expect(Collection.getMinValue(array)).to.eql(3);
    });

    it("allows values to be concated and returns the appropriate number", () => {
      const array = [3, 8, 10];
      expect(Collection.getMinValue(array, 1, 20)).to.eql(1);
    });
  });

  describe("allSetsEqual", () => {

    it("returns true when all sets are equal", () => {
      const comparisons = [
        [1, 1],
        ["wow", "wow"],
        [{ stuff: 43 }, { stuff: 43 }]
      ];

      expect(Collection.allSetsEqual(comparisons)).to.eql(true);
    });

    it("returns false when not all sets are equal", () => {
      const comparisons = [
        [1, 1],
        ["wow", "wow"],
        [{ stuff: 1 }, { stuff: 43 }]
      ];

      expect(Collection.allSetsEqual(comparisons)).to.eql(false);
    });
  });
});
