import { Vec2D } from "@/types/physics";
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


  //? Dodałem losowe funkcje moze jakas sie przyda, jak nie to wyrzucimy :)) 

  export function calculateAngleFromVelocity(velocity: Vec2D): number {
    return Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
  }

  export function calculateRotationalVelocity(force: number, radius: number, momentOfInertia: number): number {
    // Torque = F * r, więc przyspieszenie kątowe α = Torque / I (moment bezwładności)
    const torque = force * radius;
    const angularAcceleration = torque / momentOfInertia;
    return angularAcceleration;
  }
  
  export function calculateAirResistance(velocity: Vec2D, dragCoefficient: number, area: number, airDensity: number = 1.225): Vec2D {
    const speedSquared = velocity.x * velocity.x + velocity.y * velocity.y;
    const forceMagnitude = 0.5 * dragCoefficient * airDensity * area * speedSquared;
    const dragForce = {
      x: -forceMagnitude * (velocity.x / Math.sqrt(speedSquared)),
      y: -forceMagnitude * (velocity.y / Math.sqrt(speedSquared)),
    };
    return dragForce;
  }

  export function adjustAccelerationBasedOnSlope(acceleration: Vec2D, slope: number): Vec2D {
    const gravity = 9.81; // m/s^2
    const adjustedAcceleration = {
      x: acceleration.x,
      y: acceleration.y - gravity * Math.sin(slope), // Zmniejsz przyspieszenie w pionie
    };
    return adjustedAcceleration;
  }

  
}
