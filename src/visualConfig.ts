import p5 from "p5";

export const AVATAR_SIZE = 40;
export const ZOOM_SENSITIVITY = 0.0005;
export const MAX_ZOOM = 5;

export function distance(point1: number[], point2: number[]): number {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export function transformCoordinate(
  value: number,
  p: p5,
  dimension: "width" | "height",
  scale: number,
  offset: number
): number {
  // First map from PCA space (-2 to 2) to screen space
  const mapped = p.map(value, -2, 2, -p[dimension] / 2, p[dimension] / 2);
  // Then apply zoom and pan
  return mapped * scale + offset;
}
