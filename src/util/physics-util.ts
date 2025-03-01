import { Vec2D } from "@/types/physics";
import { Vector } from "./vec-util";
export namespace PhysicsUtils {
  export function normalizeAngle(angle: number) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    return normalizedAngle;
  }
  export function normalizeForceToAngle(v: Vec2D, angle: number, ratio: number) {
    let vector = Vector.scale(v, 1 - ratio);
    let secondVector = Vector.generateVectorFromAngle(Vector.length(v) * ratio, angle);
    vector = Vector.add(vector, secondVector);
    return vector;
  }
}
