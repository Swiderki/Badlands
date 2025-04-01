/* eslint-disable no-undef */
import { describe } from "node:test";
import { Vector } from "./vec-util";
import { Vec2D } from "@/types/physics";

describe("Vector Utility Functions", () => {
  test("normalize() should return a unit vector", () => {
    const v: Vec2D = { x: 3, y: 4 };
    const result = Vector.normalize(v);
    expect(result).toEqual({ x: 0.6, y: 0.8 });
  });

  test("scale() should scale a vector by a scalar", () => {
    const v: Vec2D = { x: 2, y: 3 };
    const scalar = 2;
    const result = Vector.scale(v, scalar);
    expect(result).toEqual({ x: 4, y: 6 });
  });

  test("add() should add two vectors", () => {
    const v1: Vec2D = { x: 1, y: 2 };
    const v2: Vec2D = { x: 3, y: 4 };
    const result = Vector.add(v1, v2);
    expect(result).toEqual({ x: 4, y: 6 });
  });

  test("lerp() should interpolate between two vectors", () => {
    const v1: Vec2D = { x: 0, y: 0 };
    const v2: Vec2D = { x: 10, y: 10 };
    const t = 0.5;
    const result = Vector.lerp(v1, v2, t);
    expect(result).toEqual({ x: 5, y: 5 });
  });

  test("equals() should check if two vectors are equal", () => {
    const v1: Vec2D = { x: 1, y: 1 };
    const v2: Vec2D = { x: 1, y: 1 };
    const result = Vector.equals(v1, v2);
    expect(result).toBe(true);
  });

  test("distance() should calculate the distance between two vectors", () => {
    const v1: Vec2D = { x: 0, y: 0 };
    const v2: Vec2D = { x: 3, y: 4 };
    const result = Vector.distance(v1, v2);
    expect(result).toBe(5);
  });

  test("dot() should calculate the dot product of two vectors", () => {
    const v1: Vec2D = { x: 1, y: 2 };
    const v2: Vec2D = { x: 3, y: 4 };
    const result = Vector.dot(v1, v2);
    expect(result).toBe(11);
  });

  test("generateVectorFromAngle() should create a vector from magnitude and angle", () => {
    const magnitude = 5;
    const angle = 90;
    const result = Vector.generateVectorFromAngle(magnitude, angle);
    expect({
      x: parseFloat(result.x.toFixed(10)),
      y: parseFloat(result.y.toFixed(10)),
    }).toEqual({ x: 0, y: 5 });
  });

  test("maxLength() should limit the vector's length", () => {
    const v: Vec2D = { x: 3, y: 4 };
    const maxLength = 2;
    const result = Vector.maxLength(v, maxLength);
    expect(Vector.length(result)).toBeCloseTo(2);
  });

  test("cosineSimilarity() should calculate the cosine similarity between two vectors", () => {
    const v1: Vec2D = { x: 1, y: 0 };
    const v2: Vec2D = { x: 0, y: 1 };
    const result = Vector.cosineSimilarity(v1, v2);
    expect(result).toBeCloseTo(0);
  });

  test("degreeBetweenVectors() should calculate the angle in degrees between two vectors", () => {
    const v1: Vec2D = { x: 1, y: 0 };
    const v2: Vec2D = { x: 0, y: 1 };
    const result = Vector.degreeBetweenVectors(v1, v2);
    expect(result).toBeCloseTo(90);
  });
});
