/* eslint-disable no-undef */
type StartPosition = {
  position: Vec2D;
  angle: number;
};

//* Dict that maps traction values to different types of surface
export const TRACTION_MAP: Record<number, number> = {
  [0]: -1, // 0 represents wall (area unavailable for car)
  [1]: 1, // 1 represents asphalt - best surface to drive on
  [2]: 0.7, // 2 represents dirt
  [3]: 0.3, // 3 represents ice
};

export type SVGCommand =
  | { type: "M" | "L" | "V"; x: number; y: number }
  | { type: "C"; cp1x: number; cp1y: number; cp2x: number; cp2y: number; x: number; y: number }
  | { type: "Q"; cp1x: number; cp1y: number; x: number; y: number }
  | { type: "Z" };

export type CheckPoint = {
  point: Vec2D;
  tangent: Vec2D;
  curvature: number;
};
