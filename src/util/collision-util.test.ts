/* eslint-disable no-undef */
import { getCarCorners, rayCast, lineToRectDistance } from "./collision-util";
import { Vec2D } from "@/types/physics";

describe("collision-util", () => {
  describe("getCarCorners", () => {
    it("should calculate the correct corners of a car", () => {
      const position: Vec2D = { x: 0, y: 0 };
      const width = 100;
      const height = 50;
      const angle = 0;

      const corners = getCarCorners(position, width, height, angle);
      expect(corners).toHaveLength(4);
      expect(corners).toEqual([
        { x: 5, y: 40 },
        { x: 105, y: 40 },
        { x: 5, y: 90 },
        { x: 105, y: 90 },
      ]);
    });
  });

  describe("rayCast", () => {
    it("should return the closest intersection point", () => {
      const from: Vec2D = { x: 0, y: 0 };
      const to: Vec2D = { x: 10, y: 10 };
      const corners: Vec2D[] = [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
        { x: 15, y: 15 },
        { x: 5, y: 15 },
      ];

      const intersection = rayCast(from, to, corners);

      expect(intersection).toEqual({ x: 5, y: 5 });
    });

    it("should return null if no intersection is found", () => {
      const from: Vec2D = { x: 0, y: 0 };
      const to: Vec2D = { x: -10, y: -10 };
      const corners: Vec2D[] = [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
        { x: 15, y: 15 },
        { x: 5, y: 15 },
      ];

      const intersection = rayCast(from, to, corners);

      expect(intersection).toBeNull();
    });
  });

  describe("lineToRectDistance", () => {
    it("should calculate the minimum distance from a line to a rectangle", () => {
      const from: Vec2D = { x: 0, y: 0 };
      const to: Vec2D = { x: 10, y: 10 };
      const rect: Vec2D[] = [
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 30 },
        { x: 20, y: 30 },
      ];

      const distance = lineToRectDistance(from, to, rect);

      expect(distance).toBeGreaterThan(0);
    });

    it("should return 0 if the line intersects the rectangle", () => {
      const from: Vec2D = { x: 0, y: 0 };
      const to: Vec2D = { x: 25, y: 25 };
      const rect: Vec2D[] = [
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 30 },
        { x: 20, y: 30 },
      ];

      const distance = lineToRectDistance(from, to, rect);

      expect(distance).toBe(0);
    });
  });
});
