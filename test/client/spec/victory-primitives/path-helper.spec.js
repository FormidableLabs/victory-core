/* eslint no-unused-expressions: 0 */
import PathHelpers from "src/victory-primitives/path-helpers";
import { round } from "lodash";

describe("path-helpers", () => {
  const x = 0;
  const y = 0;
  const size = 1;
  const preciseSize = 1.5;
  describe("circle", () => {
    it("draws a path for a circle at the correct location", () => {
      const pathResult = PathHelpers.circle({ x, y, size });
      expect(pathResult).to.contain(`M ${x}, ${y}`);
    });

    it("draws a path for a circle with the correct precision", () => {
      const pathResult = PathHelpers.circle({ x, y, size: preciseSize, precision: 1 });
      expect(pathResult).to.contain(`a ${preciseSize}, ${preciseSize}`);
      expect(pathResult).to.contain(`m -${preciseSize},`);
    });
  });

  describe("square", () => {
    it("draws a path for a square at the correct location", () => {
      const pathResult = PathHelpers.square({ x, y, size });
      const baseSize = 0.87 * size;
      expect(pathResult).to.contain(`M ${round(x - baseSize)}, ${round(y + baseSize)}`);
    });

    // it("draws a path for a square with the correct precision", () => {
    //   const pathResult = PathHelpers.square({ x, y, size: preciseSize });
    //   const baseSize = 0.87 * preciseSize;
    //   expect(pathResult).to.contain(`M ${round(x - baseSize)}, ${round(y + baseSize, 1)}`);
    // });
  });

  describe("diamond", () => {
    it("draws a path for a diamond at the correct location", () => {
      const pathResult = PathHelpers.diamond({ x, y, size });
      const baseSize = 0.87 * size;
      const length = Math.sqrt(2 * (baseSize * baseSize));
      expect(pathResult).to.contain(`M ${round(x)}, ${round(y + length)}`);
    });

    it("draws a path for a diamond with the correct precision", () => {
      const pathResult = PathHelpers.diamond({ x, y, size: preciseSize, precision: 1 });
      const baseSize = 0.87 * preciseSize;
      const length = Math.sqrt(2 * (baseSize * baseSize));
      expect(pathResult).to.contain(`M ${round(x)}, ${round(y + length, 1)}`);
    });
  });

  describe("triangleUp", () => {
    it("draws a path for a triangleUp at the correct location", () => {
      const pathResult = PathHelpers.triangleUp({ x, y, size });
      expect(pathResult).to.contain(`M ${x - size}, ${y + size}`);
    });
  });

  describe("triangleDown", () => {
    it("draws a path for a triangleDown at the correct location", () => {
      const pathResult = PathHelpers.triangleDown({ x, y, size });
      expect(pathResult).to.contain(`M ${x - size}, ${y - size}`);
    });
  });

  describe("plus", () => {
    it("draws a path for a plus at the correct location", () => {
      const pathResult = PathHelpers.plus({ x, y, size });
      const baseSize = 1.1 * size;
      expect(pathResult).to.contain(
        `M ${round(x - baseSize / 2.5)}, ${round(y + baseSize)}`
      );
    });

    it("draws a path for a plus with the correct precision", () => {
      const pathResult = PathHelpers.plus({ x, y, size: preciseSize, precision: 1 });
      const baseSize = 1.1 * preciseSize;
      expect(pathResult).to.contain(
        `M ${round(x - baseSize / 2.5, 1)}, ${round(y + baseSize, 1)}`
      );
    });
  });

  describe("star", () => {
    it("draws a path for a star at the correct location", () => {
      const pathResult = PathHelpers.star({ x, y, size });
      const angle = Math.PI / 5;
      expect(pathResult).to.contain(`M ${(1.35 * size) * Math.sin(angle) + x },
        ${(1.35 * size) * Math.cos(angle) + y}`);
    });
  });
});
