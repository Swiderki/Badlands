import { TrackPath } from "@/src/services/track-driver/track-path";
import BaseDrivingPolicy from "./base-driving-policy";
import { Vec2D, Action } from "@/types/physics";
import { PhysicsUtils } from "../../util/physics-util";

const accPrecision = 0.01;
const breakPrecision = 0.01;

//* This import is here only for debugging purposes
import DisplayDriver from "@/src/services/display-driver/display-driver";
import { Vector } from "@/src/util/vec-util";

class MiddleDrivingPolicy extends BaseDrivingPolicy {
  private _visitedCheckpoint: number = 1;
  private maxSpeed = 190;
  private corneringSpeed = 30;

  constructor(trackPath: TrackPath, scaling_factor: number) {
    super(trackPath, scaling_factor);
  }

  private updateCurrentCheckPoint(car_position: Vec2D) {
    const distanceToNextCheckpoint = this._enemyPath.getDistanceToPoint(
      car_position,
      this._visitedCheckpoint
    );

    if (
      (distanceToNextCheckpoint < 30 && this._visitedCheckpoint !== this._enemyPath.sampledPoints.length) ||
      (distanceToNextCheckpoint < 2 && this._visitedCheckpoint === this._enemyPath.sampledPoints.length) ||
      isNaN(distanceToNextCheckpoint)
    ) {
      this._visitedCheckpoint++;
    }

    if (this._visitedCheckpoint === this._enemyPath.sampledPoints.length) {
      this._visitedCheckpoint = 1;
      if (this.parentRef !== null) this.parentRef.currentLap++;
    }
  }

  private getDistance(p1: Vec2D, p2: Vec2D): number {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  private getAngleDifference(target: Vec2D, car_position: Vec2D, current_rotation: number): number {
    const target_angle = PhysicsUtils.normalizeAngle(
      Math.atan2(target.y - car_position.y, target.x - car_position.x) * (180 / Math.PI)
    );

    const angle_diff = target_angle - current_rotation;
    return angle_diff > 180 ? angle_diff - 360 : angle_diff < -180 ? angle_diff + 360 : angle_diff;
  }

  private computeRotation(angle_diff: number, max_rotation: number = 12): number {
    return angle_diff < 0 ? Math.max(angle_diff, -max_rotation) : Math.min(angle_diff, max_rotation);
  }

  private actualForceToVelocity(actualForce: Vec2D, current_rotation: number): number {
    const forwardVector = {
      x: Math.cos(current_rotation * (Math.PI / 180)),
      y: Math.sin(current_rotation * (Math.PI / 180)),
    };
    return Math.hypot(actualForce.x * forwardVector.x, actualForce.y * forwardVector.y);
  }

  private getTargetSpeed(curvature: number): number {
    // Normalize curvature: 0 means straight, 1 (or more) means a sharp turn
    const normalizedCurvature = Math.min(Math.abs(curvature * 10), 1);

    // Linear interpolation between corneringSpeed and maxSpeed
    return this.corneringSpeed + (this.maxSpeed - this.corneringSpeed) * (1 - normalizedCurvature);
  }

  override getAction(current_position: Vec2D, current_rotation: number, actualForce: Vec2D): Action {
    this.updateCurrentCheckPoint(current_position);
    const car_position = { ...current_position };
    const target = this._enemyPath.sampledPoints[this._visitedCheckpoint].point;
    const checkpoint = this._enemyPath.sampledPoints[this._visitedCheckpoint];
    const angle_diff = this.getAngleDifference(target, car_position, current_rotation);
    const rotation = this.computeRotation(angle_diff);
    const targetSpeed = this.getTargetSpeed(checkpoint.curvature);

    const currentVelocity = this.actualForceToVelocity(actualForce, current_rotation);
    const shouldAccelerate = currentVelocity - targetSpeed < accPrecision;
    const shouldBrake = targetSpeed - currentVelocity < breakPrecision;
    console.table({
      curvature: checkpoint.curvature,
      targetSpeed,
      currentVelocity,
      shouldAccelerate,
      shouldBrake,
    });

    //* Debugging visualization
    DisplayDriver.currentInstance?.drawLineBetweenVectors(car_position, target, "#0066ff");
    DisplayDriver.currentInstance?.drawPoint(target, 4, "#0000ff");

    return {
      acceleration: shouldAccelerate,
      rotation,
      brake: shouldBrake,
      accelerationPower: checkpoint.curvature,
    };
  }
}

export default MiddleDrivingPolicy;
