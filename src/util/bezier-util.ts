import { Vec2D } from "@/types/physics";
import { SVGCommand } from "@/types/track-driver";
import { Bezier } from "bezier-js";

export function parseSVGPath(svgPath: string): SVGCommand[] {
  const commands = svgPath.match(/[MLCQZ][^MLCQZ]*/g); // Extract path commands
  const points: SVGCommand[] = [];

  if (!commands) return points;

  for (const command of commands) {
    //* Extract command type and values
    const type = command[0] as "M" | "L" | "C" | "Q" | "Z";
    const values = command.slice(1).trim().split(/[ ,]+/).map(Number);

    //* gigant switch to handle different types of commands
    switch (type) {
      case "M": //? Move to
      case "L": //? Line to
        points.push({ type, x: values[0], y: values[1] });
        break;
      case "C": //? Cubic Bezier curve
        points.push({
          type,
          cp1x: values[0],
          cp1y: values[1],
          cp2x: values[2],
          cp2y: values[3],
          x: values[4],
          y: values[5],
        });
        break;
      case "Q": //? Quadratic Bezier curve
        points.push({
          type,
          cp1x: values[0],
          cp1y: values[1],
          x: values[2],
          y: values[3],
        });
        break;
      case "Z": //? Close path
        points.push({ type });
        break;
    }
  }

  return points;
}

export function getEvenlySpacedPoints(commands: SVGCommand[], numPoints: number): Vec2D[] {
  const sampledPoints: Vec2D[] = [];

  for (const command of commands) {
    if (command.type === "C") {
      const bezier = new Bezier(
        { x: command.cp1x, y: command.cp1y },
        { x: command.cp2x, y: command.cp2y },
        { x: command.x, y: command.y }
      );
      for (let t = 0; t <= 1; t += 1 / numPoints) {
        const { x, y } = bezier.get(t);
        sampledPoints.push({ x, y });
      }
    } else if (command.type === "Q") {
      const bezier = new Bezier(
        { x: command.cp1x, y: command.cp1y },
        { x: command.cp1x, y: command.cp1y },
        { x: command.x, y: command.y },
        { x: command.x, y: command.y }
      );
      for (let t = 0; t <= 1; t += 1 / numPoints) {
        const { x, y } = bezier.get(t);
        sampledPoints.push({ x, y });
      }
    } else if (command.type === "L" || command.type === "M") {
      sampledPoints.push({ x: command.x, y: command.y });
    }
  }

  return sampledPoints;
}
