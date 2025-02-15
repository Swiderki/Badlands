export namespace PhysicsUtils {
  export function calculateForceVector(magnitude: number, angle: number) {
    const radianAngle = (angle * Math.PI) / 180;
    return {
      x: magnitude * Math.cos(radianAngle),
      y: magnitude * Math.sin(radianAngle),
    };
  }

  export function normalizeAngle(angle: number) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    return normalizedAngle;
  }
}
