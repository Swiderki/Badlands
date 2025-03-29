import { TrackPath } from "@/src/services/track-driver/track-path";
import BaseDrivingPolicy from "./base-driving-policy";
import { Vec2D, Action } from "@/types/physics";
import { PhysicsUtils } from "../../util/physics-util";
import DisplayDriver from "@/src/services/display-driver/display-driver";
import PlayerController from "../player-controller";
import { CheckPoint } from "@/types/track-driver";
import { EnemyPath } from "@/src/services/track-driver/enemy-path";
import { Vector } from "@/src/util/vec-util";

class SuperAggressiveDrivingPolicy extends BaseDrivingPolicy {
  private maxSpeed = 190;
  private corneringSpeed = 30;
  _visitedCheckpoint: number = 1;
  private attackRange = 50; // Odległość, w której próbuje uderzyć gracza

  constructor(trackPath: EnemyPath, scaling_factor: number) {
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
  
  //* On the other hand this one is responsible for progression in the actual path
  // private updateActualPath(car_position: Vec2D) {
  //   if (this.parentRef !== null) this._enemyPath.updateActualTrackPathIfIntersects(this.parentRef);
  //   const distanceToNextCheckpoint = this._enemyPath.getDistanceToActualPoint(car_position);

  //   if (distanceToNextCheckpoint < 20) {
  //     this._enemyPath.actualPathCurrentPoint += 1;
  //   }
  // }

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

  private getTargetSpeed(curvature: number, scalar: number = 1): number {
    const normalizedCurvature = Math.min(Math.abs(curvature * 10), 1);
    return (this.corneringSpeed + (this.maxSpeed - this.corneringSpeed) * (1 - normalizedCurvature)) * scalar;
  }

  private getTarget(current_position: Vec2D): { shouldAttack: boolean; speed: number; target: CheckPoint } {
    // this.updateActualPath(current_position);
    this.updateCurrentCheckPoint(current_position);
    
    if (PlayerController.currentInstance !== null) {
      const playerPosition = PlayerController.currentInstance!.centerPosition;
      const playerDirection = PlayerController.currentInstance!.angle;

      const nextPlayerStep = Vector.generateVectorFromAngle(this.attackRange, playerDirection);

      const positionBeforePlayer = Vector.add(playerPosition, nextPlayerStep);

      const dd = DisplayDriver.currentInstance!
      dd.drawLineBetweenVectors(playerPosition, positionBeforePlayer, "#ffffff");

      const distanceToPlayer = this.getDistance(current_position, positionBeforePlayer);
      const shouldAttack = distanceToPlayer < this.attackRange;
      if (shouldAttack) {
        return {
          shouldAttack: true,
          speed: distanceToPlayer/this.attackRange,
          target: { point: positionBeforePlayer, curvature: 0, tangent: positionBeforePlayer },
        };
      }
    }

    return { shouldAttack: false, speed: 1, target: this._enemyPath.sampledPoints[this._visitedCheckpoint] };
  }

  override getAction(current_position: Vec2D, current_rotation: number, actualForce: Vec2D): Action {

    const { target, speed, shouldAttack } = this.getTarget(current_position);

    const angle_diff = this.getAngleDifference(target.point, current_position, current_rotation);
    const rotation = this.computeRotation(angle_diff);
    const targetSpeed = this.getTargetSpeed(target.curvature, speed);

    const currentVelocity = Math.hypot(actualForce.x, actualForce.y);
    const shouldAccelerate = currentVelocity < targetSpeed;
    const shouldBrake = currentVelocity > targetSpeed;

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
      accelerationPower: shouldAttack ? 1.5 : 1,
    };
  }
}

export default SuperAggressiveDrivingPolicy;
