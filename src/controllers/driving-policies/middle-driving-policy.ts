import { Scoreboard } from "@/src/services/scoreboard/scoreboard";
import { Action, Vec2D } from "@/types/physics";
import { PhysicsUtils } from "../../util/physics-util";
import BaseDrivingPolicy from "./base-driving-policy";
const accPrecision = 0.01;
const breakPrecision = 0.01;

//* This import is here only for debugging purposes
import { EnemyPath } from "@/src/services/track-driver/enemy-path";

class MiddleDrivingPolicy extends BaseDrivingPolicy {
  private maxSpeed = 200;
  private corneringSpeed = 200;

  private distanceToCheckpointTreshold = 20;

  constructor(trackPath: EnemyPath, scaling_factor: number) {
    super(trackPath, scaling_factor);
  }

  //* This one keeps track of progression in the whole track, stuff like laps and if its going backwards
  private updateCurrentCheckPoint(car_position: Vec2D) {
    const distanceToNextCheckpoint = this._enemyPath.getDistanceToPoint(
      car_position,
      this._enemyPath.visitedCheckpoints
    );

    if (
      (distanceToNextCheckpoint < this.distanceToCheckpointTreshold &&
        this._enemyPath.visitedCheckpoints !== this._enemyPath.sampledPoints.length) ||
      (distanceToNextCheckpoint < 2 &&
        this._enemyPath.visitedCheckpoints === this._enemyPath.sampledPoints.length) ||
      isNaN(distanceToNextCheckpoint)
    ) {
      this._enemyPath.visitedCheckpoints++;
    }

    if (this._enemyPath.visitedCheckpoints === this._enemyPath.sampledPoints.length) {
      this._enemyPath.visitedCheckpoints = 1;
      if (this.parentRef !== null) {
        this.parentRef.currentLap++;
        if (
          this.parentRef.bestLoopTime > Scoreboard.instance.currentTime - this.parentRef.finishedLoopTime ||
          this.parentRef.bestLoopTime === 0
        ) {
          this.parentRef.bestLoopTime = Scoreboard.instance.currentTime - this.parentRef.finishedLoopTime;
        }
        this.parentRef.finishedLoopTime = Scoreboard.instance.currentTime;
      }
    }
  }

  //* On the other hand this one is responsible for progression in the actual path
  private updateActualPath(car_position: Vec2D) {
    if (this.parentRef !== null) this._enemyPath.updateActualTrackPathIfIntersects(this.parentRef);
    const distanceToNextCheckpoint = this._enemyPath.getDistanceToActualPoint(car_position);

    if (distanceToNextCheckpoint < this.distanceToCheckpointTreshold) {
      this._enemyPath.actualPathCurrentPoint += 1;
    }
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
    this.updateActualPath(current_position);
    const car_position = { ...current_position };
    const target = this._enemyPath.currentTargetCheckPoint.point;
    const checkpoint = this._enemyPath.currentTargetCheckPoint;
    const angle_diff = this.getAngleDifference(target, car_position, current_rotation);
    const rotation = this.computeRotation(angle_diff);
    const targetSpeed = this.getTargetSpeed(checkpoint.curvature);

    const currentVelocity = this.actualForceToVelocity(actualForce, current_rotation);
    const shouldAccelerate = currentVelocity - targetSpeed < accPrecision;
    const shouldBrake = targetSpeed - currentVelocity < breakPrecision;

    return {
      acceleration: shouldAccelerate,
      rotation,
      brake: shouldBrake,
      accelerationPower: checkpoint.curvature,
    };
  }
}

export default MiddleDrivingPolicy;
