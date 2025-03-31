import BaseDrivingPolicy from "./base-driving-policy";
import PlayerController from "../player-controller";
import { Vector } from "@/src/util/vec-util";
import { Vec2D, Action } from "@/types/physics";
import { PhysicsUtils } from "../../util/physics-util";
import { CheckPoint } from "@/types/track-driver";

const accPrecision = 0.01;
const breakPrecision = 0.01;

//* This import is here only for debugging purposes
import DisplayDriver from "@/src/services/display-driver/display-driver";
import { EnemyPath } from "@/src/services/track-driver/enemy-path";

class SuperAggressiveDrivingPolicy extends BaseDrivingPolicy {
  private maxSpeed = 200;
  private corneringSpeed = 200;
  
  private attackRange = 70;
  private tooCloseRange = 10;
  private distanceBeforePlayer = 70;
  private maxDegreeToAttack = 80;

  private furtherDistanceToCheckpointTreshold = 40;
  private closerDistanceToCheckpointTreshold = 20;

  private distanceToCheckpointTreshold = this.closerDistanceToCheckpointTreshold;

  constructor(trackPath: EnemyPath, scaling_factor: number) {
    super(trackPath, scaling_factor);
  }

  private getDistance(p1: Vec2D, p2: Vec2D): number {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  private getTarget(current_position: Vec2D): { shouldAttack: boolean; speed: number; target: CheckPoint } {
    if (PlayerController.currentInstance !== null && !PlayerController.currentInstance.finished) {
      const playerPosition = PlayerController.currentInstance!.centerPosition;
      const playerDirection = PlayerController.currentInstance!.angle;

      const nextPlayerStep = Vector.generateVectorFromAngle(this.distanceBeforePlayer, playerDirection);

      const positionBeforePlayer = Vector.add(playerPosition, nextPlayerStep);

      const dd = DisplayDriver.currentInstance!
      dd.drawLineBetweenVectors(playerPosition, positionBeforePlayer, "#ffffff");

      const distanceToPlayer = this.getDistance(current_position, positionBeforePlayer);
      const isCloseEnough = distanceToPlayer < this.attackRange;
      const isntTooClose = distanceToPlayer > this.tooCloseRange;
      const isDegreeGood = Vector.degreeBetweenVectors(Vector.subtract(positionBeforePlayer, current_position), nextPlayerStep) < this.maxDegreeToAttack;
      if (isCloseEnough && isDegreeGood && isntTooClose) {
        this.distanceToCheckpointTreshold = this.furtherDistanceToCheckpointTreshold;
        return {
          shouldAttack: true,
          speed: distanceToPlayer/this.attackRange*1.5, //! Heuristics
          target: { point: positionBeforePlayer, curvature: 0, tangent: positionBeforePlayer },
        };
      }
    }
    this.distanceToCheckpointTreshold = this.closerDistanceToCheckpointTreshold;
    return { shouldAttack: false, speed: 1, target: this._enemyPath.currentTargetCheckPoint };
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
      if (this.parentRef !== null) this.parentRef.currentLap++;
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

  private getTargetSpeed(curvature: number, scalar: number = 1): number {
    const normalizedCurvature = Math.min(Math.abs(curvature * 10), 1);
    return (this.corneringSpeed + (this.maxSpeed - this.corneringSpeed) * (1 - normalizedCurvature)) * scalar;
  }


  override getAction(current_position: Vec2D, current_rotation: number, actualForce: Vec2D): Action {
    this.updateCurrentCheckPoint(current_position);
    this.updateActualPath(current_position);

    const { target, speed, shouldAttack } = this.getTarget(current_position);

    const car_position = { ...current_position };
    const checkpoint = this._enemyPath.currentTargetCheckPoint;
    const angle_diff = this.getAngleDifference(target.point, car_position, current_rotation);
    const rotation = this.computeRotation(angle_diff);
    const targetSpeed = this.getTargetSpeed(checkpoint.curvature, speed);

    const currentVelocity = this.actualForceToVelocity(actualForce, current_rotation);
    const shouldAccelerate = currentVelocity - targetSpeed < accPrecision;
    const shouldBrake = targetSpeed - currentVelocity < breakPrecision;

    //* Debugging visualization
    DisplayDriver.currentInstance?.drawLineBetweenVectors(
        current_position,
        target.point,
        shouldAttack ? "#ff0000" : "#0066ff"
    );
    DisplayDriver.currentInstance?.drawPoint(target.point, 4, shouldAttack ? "#ff0000" : "#0000ff");

    return {
      acceleration: shouldAccelerate,
      rotation,
      brake: shouldBrake,
      accelerationPower: checkpoint.curvature,
    };
  }
}

export default SuperAggressiveDrivingPolicy;
