import { Vec2D } from "@/types/physics";
import { CheckPoint, SVGCommand } from "@/types/track-driver";
import { Bezier } from "bezier-js";
import { Vector } from "./vec-util";

export function parseSVGPath(svgPath: string): SVGCommand[] {
  const commands = svgPath.match(/[MLCQZVv][^MLCQZVv]*/g); // Include 'V' and 'v' in the regex
  const points: SVGCommand[] = [];

  if (!commands) return points;

  let currentX = 0; // Initialize currentX
  let currentY = 0; // Initialize currentY

  for (const command of commands) {
    const type = command[0] as "M" | "L" | "C" | "Q" | "V" | "v" | "Z";
    const values = command.slice(1).trim().split(/[ ,]+/).map(Number);

    switch (type) {
      case "M": // Move to
        currentX = values[0];
        currentY = values[1];
        points.push({ type, x: currentX, y: currentY });
        break;
      case "L": // Line to
        currentX = values[0];
        currentY = values[1];
        points.push({ type, x: currentX, y: currentY });
        break;
      case "C": // Cubic Bezier curve
        points.push({
          type,
          cp1x: values[0],
          cp1y: values[1],
          cp2x: values[2],
          cp2y: values[3],
          x: values[4],
          y: values[5],
        });
        currentX = values[4];
        currentY = values[5];
        break;
      case "Q": // Quadratic Bezier curve
        points.push({
          type,
          cp1x: values[0],
          cp1y: values[1],
          x: values[2],
          y: values[3],
        });
        currentX = values[2];
        currentY = values[3];
        break;
      case "V": // Vertical line to (absolute)
        currentY = values[0];
        points.push({ type, x: currentX, y: currentY });
        break;
      case "v": // Vertical line to (relative)
        currentY += values[0];
        points.push({ type: "V", x: currentX, y: currentY });
        break;
      case "Z": // Close path
        points.push({ type });
        break;
    }
  }

  return points;
}

export function getEvenlySpacedPoints(commands: SVGCommand[], numPoints: number): CheckPoint[] {
  const sampledPoints: CheckPoint[] = [];

  for (const command of commands) {
    if (command.type === "C") {
      // Cubic Bezier curve
      const previous = sampledPoints[sampledPoints.length - 1];
      const bezier = new Bezier(
        previous.point,
        { x: command.cp2x, y: command.cp2y },
        { x: command.x, y: command.y }
      );
      for (let t = 0; t <= 1; t += 1 / numPoints) {
        const { x, y } = bezier.get(t);

        // Tangent and curvature computation
        const tangent = bezier.derivative(t);
        //* Type error in libary plis ignore
        // this one is need because of error in library types @ts-expect-error
        const curvature = bezier.curvature(t).k;

        sampledPoints.push({ point: { x, y }, tangent, curvature });
      }
    } else if (command.type === "Q") {
      // Quadratic Bezier curve
      const previous = sampledPoints[sampledPoints.length - 1];
      const bezier = new Bezier(
        { x: command.cp1x, y: command.cp1y },
        { x: command.cp1x, y: command.cp1y },
        { x: command.x, y: command.y }
      );
      for (let t = 0; t <= 1; t += 1 / numPoints) {
        const { x, y } = bezier.get(t);

        // Tangent and curvature computation
        const tangent = bezier.derivative(t);
        //* Type error in libary plis ignore
        // this one is need because of error in library types @ts-expect-error
        const curvature = bezier.curvature(t).k;

        sampledPoints.push({ point: { x, y }, tangent, curvature });
      }
    } else if (command.type === "L" || command.type === "M" || command.type === "V") {
      // For straight lines, evenly interpolate the points
      const startPoint: Vec2D = { x: command.x, y: command.y };

      // Tangent is undefined for straight lines, but we can calculate it as a direction vector
      const endPoint: Vec2D = { x: command.x, y: command.y };
      const direction = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };

      // Curvature is zero for straight lines
      const curvature = 0;

      // Generate points between the start and end points
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = startPoint.x + direction.x * t;
        const y = startPoint.y + direction.y * t;

        // Tangent as the direction vector
        const tangent: Vec2D = direction;

        sampledPoints.push({ point: { x, y }, tangent, curvature });
      }
    } else if (command.type === "Z") {
      continue;
    }
  }
  return sampledPoints;
}
