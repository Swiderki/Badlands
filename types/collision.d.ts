import { Vec2D } from "./physics";

export type CollisionObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
};

export type PathIntersection = {
  intersectionStartIndex: number;
  intersectionEndIndex: number;
  objectCorners: Vec2D[];
  distance: number;
};
