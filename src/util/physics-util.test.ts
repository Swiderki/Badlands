/* eslint-disable no-undef */
import { PhysicsUtils } from "./physics-util";

describe("PhysicsUtils", () => {
  describe("normalizeAngle", () => {
    it("should normalize positive angles greater than 360", () => {
      expect(PhysicsUtils.normalizeAngle(450)).toBe(90);
    });

    it("should normalize negative angles", () => {
      expect(PhysicsUtils.normalizeAngle(-90)).toBe(270);
    });

    it("should return the same angle if it's already normalized", () => {
      expect(PhysicsUtils.normalizeAngle(45)).toBe(45);
    });
  });


  describe("linearRegression", () => {
    it("should calculate the slope and y-intercept for a set of points", () => {
      const points = [
        { x: 1, y: 0 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
      ];

      const [slope, intercept] = PhysicsUtils.linearRegression(points);

      expect(slope).toBe(Infinity);
      expect(intercept).toBe(1);
    });



    it("should handle vertical lines by returning Infinity as the slope", () => {
      const points = [
        { x: 2, y: 1 },
        { x: 2, y: 3 },
      ];

      const [slope, xIntercept] = PhysicsUtils.linearRegression(points);

      expect(slope).toBe(Infinity);
      expect(xIntercept).toBe(2);
    });
  });
});
