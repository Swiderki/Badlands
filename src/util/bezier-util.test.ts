/* eslint-disable no-undef */
import { SVGCommand } from "@/types/track-driver";
import { getEvenlySpacedPoints, parseSVGPath } from "./bezier-util";

describe("parseSVGPath", () => {
  it("should parse a simple move-to command", () => {
    const svgPath = "M10 20";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([{ type: "M", x: 10, y: 20 }]);
  });

  it("should parse a line-to command", () => {
    const svgPath = "L30 40";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([{ type: "L", x: 30, y: 40 }]);
  });

  it("should parse a cubic bezier curve command", () => {
    const svgPath = "C10 20 30 40 50 60";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([
      {
        type: "C",
        cp1x: 10,
        cp1y: 20,
        cp2x: 30,
        cp2y: 40,
        x: 50,
        y: 60,
      },
    ]);
  });

  it("should parse a vertical line-to command", () => {
    const svgPath = "V50";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([{ type: "V", x: 0, y: 50 }]);
  });

  it("should parse a horizontal line-to command", () => {
    const svgPath = "H100";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([{ type: "H", x: 100, y: 0 }]);
  });

  it("should handle an empty path", () => {
    const svgPath = "";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([]);
  });

  it("should parse a complex path with multiple commands", () => {
    const svgPath = "M10 20 L30 40 C50 60 70 80 90 100 Z";
    const result = parseSVGPath(svgPath);
    expect(result).toEqual([
      { type: "M", x: 10, y: 20 },
      { type: "L", x: 30, y: 40 },
      {
        type: "C",
        cp1x: 50,
        cp1y: 60,
        cp2x: 70,
        cp2y: 80,
        x: 90,
        y: 100,
      },
      { type: "Z" },
    ]);
  });
});

describe("getEvenlySpacedPoints", () => {
  it("should generate evenly spaced points for a cubic bezier curve", () => {
    const commands: SVGCommand[] = [
      { type: "M", x: 0, y: 0 },
      {
        type: "C",
        cp1x: 10,
        cp1y: 20,
        cp2x: 30,
        cp2y: 40,
        x: 50,
        y: 60,
      },
    ];
    const result = getEvenlySpacedPoints(commands, 5);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("point");
    expect(result[0]).toHaveProperty("tangent");
    expect(result[0]).toHaveProperty("curvature");
  });

  it("should generate evenly spaced points for a straight line", () => {
    const commands: SVGCommand[] = [
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 10 },
    ];
    const result = getEvenlySpacedPoints(commands, 5);
    expect(result.length).toBe(12);
    expect(result[0].point).toEqual({ x: 0, y: 0 });
    expect(result[result.length - 1].point).toEqual({ x: 10, y: 10 });
  });

  it("should handle an empty command list", () => {
    const commands: SVGCommand[] = [];
    const result = getEvenlySpacedPoints(commands, 5);
    expect(result).toEqual([]);
  });

  it("should handle vertical and horizontal lines", () => {
    const commands: SVGCommand[] = [
      { type: "M", x: 0, y: 0 },
      { type: "V", x: 0, y: 10 },
      { type: "H", x: 10, y: 10 },
    ];
    const result = getEvenlySpacedPoints(commands, 5);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].point).toEqual({ x: 0, y: 0 });
    expect(result[result.length - 1].point).toEqual({ x: 10, y: 10 });
  });
});
