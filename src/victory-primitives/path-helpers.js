import { range } from "lodash";

const round = (value, precision) => {
  const factor = Math.pow(10, precision || 0);
  return Math.round(value * factor, precision) / factor;
};

export default {
  circle(options) {
    const { x, y, size, precision } = options;
    const s = round(size, precision);
    return `M ${round(x, precision)}, ${round(y, precision)} m ${-s}, 0
      a ${s}, ${s} 0 1,0 ${s * 2},0
      a ${s}, ${s} 0 1,0 ${-s * 2},0`;
  },

  square(options) {
    const { x, y, size, precision } = options;
    const baseSize = 0.87 * size;
    const x0 = round(x - baseSize, precision);
    const x1 = round(x + baseSize, precision);
    const y0 = round(y - baseSize, precision);
    const y1 = round(y + baseSize, precision);
    return `M ${x0}, ${y1}
      L ${x1}, ${y1}
      L ${x1}, ${y0}
      L ${x0}, ${y0}
      z`;
  },

  diamond(options) {
    const { x, y, size, precision } = options;
    const baseSize = 0.87 * size;
    const length = Math.sqrt(2 * (baseSize * baseSize));
    return `M ${round(x, precision)}, ${round(y + length, precision)}
      L ${round(x + length, precision)}, ${round(y, precision)}
      L ${round(x, precision)}, ${round(y - length, precision)}
      L ${round(x - length, precision)}, ${round(y, precision)}
      z`;
  },

  triangleDown(options) {
    const { x, y, size, precision } = options;
    const height = (size / 2 * Math.sqrt(3));
    const x0 = round(x - size, precision);
    const x1 = round(x + size, precision);
    const y0 = round(y - size, precision);
    const y1 = round(y + height, precision);
    return `M ${x0}, ${y0}
      L ${x1}, ${y0}
      L ${round(x, precision)}, ${y1}
      z`;
  },

  triangleUp(options) {
    const { x, y, size, precision } = options;
    const height = (size / 2 * Math.sqrt(3));
    const x0 = round(x - size, precision);
    const x1 = round(x + size, precision);
    const y0 = round(y - height, precision);
    const y1 = round(y + size, precision);
    return `M ${x0}, ${y1}
      L ${x1}, ${y1}
      L ${round(x, precision)}, ${y0}
      z`;
  },

  plus(options) {
    const { x, y, size, precision } = options;
    const baseSize = 1.1 * size;
    return `M ${round(x - baseSize / 2.5, precision)}, ${round(y + baseSize, precision)}
      L ${round(x + baseSize / 2.5, precision)}, ${round(y + baseSize, precision)}
      L ${round(x + baseSize / 2.5, precision)}, ${round(y + baseSize / 2.5, precision)}
      L ${round(x + baseSize, precision)}, ${round(y + baseSize / 2.5, precision)}
      L ${round(x + baseSize, precision)}, ${round(y - baseSize / 2.5, precision)}
      L ${round(x + baseSize / 2.5, precision)}, ${round(y - baseSize / 2.5, precision)}
      L ${round(x + baseSize / 2.5, precision)}, ${round(y - baseSize, precision)}
      L ${round(x - baseSize / 2.5, precision)}, ${round(y - baseSize, precision)}
      L ${round(x - baseSize / 2.5, precision)}, ${round(y - baseSize / 2.5, precision)}
      L ${round(x - baseSize, precision)}, ${round(y - baseSize / 2.5, precision)}
      L ${round(x - baseSize, precision)}, ${round(y + baseSize / 2.5, precision)}
      L ${round(x - baseSize / 2.5, precision)}, ${round(y + baseSize / 2.5, precision)}
      z`;
  },

  star(options) {
    const { x, y, size } = options;
    const baseSize = 1.35 * size;
    const angle = Math.PI / 5;
    const starCoords = range(10).map((index) => {
      const length = index % 2 === 0 ? baseSize : baseSize / 2;
      return `${length * Math.sin(angle * (index + 1)) + x},
        ${length * Math.cos(angle * (index + 1)) + y}`;
    });
    return `M ${starCoords.join("L")} z`;
  }
};
