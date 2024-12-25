import p5 from "p5";

export const AVATAR_SIZE = 40;
export const MAX_ZOOM = 5;
export const ZOOM_SENSITIVITY = 0.001;

export const distance = ([x1, y1]: number[], [x2, y2]: number[]) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

export const transformCoordinate = (
  value: number,
  p: p5,
  dimension: "width" | "height",
  zoomLevel: number,
  panOffset: number
) => {
  const center = p[dimension] / 2;
  const mapped = p.map(value, -2, 2, 100, p[dimension] - 100);
  return center + (mapped - center) * zoomLevel + panOffset;
};
