import { Vec2D } from "@/types/physics";
export namespace PhysicsUtils {
  export function normalizeAngle(angle: number) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    return normalizedAngle;
  }
}
