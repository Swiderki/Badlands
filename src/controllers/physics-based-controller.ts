import { DisplayData, Sprite } from "@/types/display-driver";

import { CollisionObject } from "@/types/collision";
import GameTimeline from "../services/game-logic/game-timeline";
import { PhysicsUtils } from "../util/physics-util";
import TimedEffectDriver from "../services/effect/timed-effect-driver";
import { Vec2D } from "@/types/physics";
import { Vector } from "../util/vec-util";
import assert from "../util/assert";

const spriteCount = 60;
abstract class PhysicsBasedController {
  sprite: Sprite | null = null;
  currentSpriteIndex: number = 0;

  position: Vec2D = { x: 0, y: 0 };
  actualForce: Vec2D = { x: 0, y: 0 };
  velocity: Vec2D = { x: 0, y: 0 };
  acceleration: Vec2D = { x: 0, y: 0 };
  angle: number = 0;
  brakingForce: number = 0;

  steeringForce: number = 0;
  isTurning: boolean = false;

  maxSpeedForward: number = 300;
  maxSpeedBackward: number = 180;
  accelerationPowerForward: number = 9;
  accelerationPowerBackward: number = 7;
  defaultAdhesionModifier: number = 1;
  traction: number = 0.9;

  currentMaxSpeedForward: number = this.maxSpeedForward;
  currentMaxSpeedBackward: number = this.maxSpeedBackward;
  currentAccelerationPowerForward: number = this.accelerationPowerForward;
  currentAccelerationPowerBackward: number = this.accelerationPowerBackward;
  currentAdhesionModifier: number = this.defaultAdhesionModifier;

  colliderWidth: number = 2;
  colliderHeight: number = 4;

  timedEffectDriver: TimedEffectDriver = new TimedEffectDriver();

  private readonly NITRO_DURATION: number = 500;
  private readonly NITRO_REFUEL_COOLDOWN: number = 3000;
  private readonly NITRO_SPEED_MODIFIER: number = 2;
  private readonly NITRO_ACCELERATION_MODIFIER: number = 4;
  private currentRefuelingTimestamp: number = -1;
  private isNitroActive = false;

  invisible = false;
  noCollision = false;

  constructor(sprite: Sprite, traction: number) {
    this.sprite = sprite;
    this.traction = traction;

    this.colliderHeight = 30;
    this.colliderWidth = 14;
    this.updateCurrentSprite();
  }

  get centerPosition(): Vec2D {
    return {
      x: this.position.x + this.colliderWidth / 2 + 30,
      y: this.position.y + this.colliderHeight / 2 + 15,
    };
  }

  resetToDefaultSpeedAndAcceleration(): void {
    this.currentMaxSpeedForward = this.maxSpeedForward;
    this.currentMaxSpeedBackward = this.maxSpeedBackward;
    this.currentAccelerationPowerForward = this.accelerationPowerForward;
    this.currentAccelerationPowerBackward = this.accelerationPowerBackward;
  }

  resetToDefaultAdhesionModifier(): void {
    this.currentAdhesionModifier = this.defaultAdhesionModifier;
  }

  accelerateForward(): void {
    if (Vector.length(this.actualForce) < this.currentMaxSpeedForward) {
      this.applyForce(this.currentAccelerationPowerForward);
    }
  }

  brake(): void {
    if (Vector.length(this.actualForce) < 0.05) {
      this.actualForce = { x: 0, y: 0 };
    }

    const diff = this.calculateAngleDifference(Vector.angle(this.actualForce), this.angle);
    if (this.shouldApplyReverseForce(diff)) {
      if (Vector.length(this.actualForce) < this.currentMaxSpeedBackward) {
        this.applyForce(-1 * this.currentAccelerationPowerBackward);
      }
    } else {
      this.brakingForce = 0.05;
    }
  }

  private calculateAngleDifference(angle1: number, angle2: number): number {
    return Math.abs(angle1 - angle2) % 360;
  }

  private shouldApplyReverseForce(angleDifference: number): boolean {
    return angleDifference > 90 || Vector.length(this.actualForce) === 0;
  }

  applyForce(magnitude: number) {
    this.acceleration = Vector.generateVectorFromAngle(magnitude, this.angle);
  }

  enterNitroMode(onRefuel?: () => void) {
    if (this.isNitroActive || this.isNitroOnCooldown()) {
      return;
    }

    this.activateNitroMode();

    this.timedEffectDriver.addEffect("nitro", {
      canBeOverrided: false,
      duration: this.NITRO_DURATION,
      finish: () => this.deactivateNitroMode(onRefuel),
      startTimestamp: GameTimeline.now(),
      update: () => {},
    });
  }

  private isNitroOnCooldown(): boolean {
    return GameTimeline.now() < this.currentRefuelingTimestamp + this.NITRO_REFUEL_COOLDOWN;
  }

  private activateNitroMode(): void {
    this.isNitroActive = true;
    this.currentMaxSpeedForward *= this.NITRO_SPEED_MODIFIER;
    this.currentMaxSpeedBackward *= this.NITRO_SPEED_MODIFIER;
    this.currentAccelerationPowerForward *= this.NITRO_ACCELERATION_MODIFIER;
    this.currentAccelerationPowerBackward *= this.NITRO_ACCELERATION_MODIFIER;
  }

  private deactivateNitroMode(onRefuel?: () => void): void {
    // this.resetToDefaultSpeedAndAcceleration();
    this.currentMaxSpeedForward /= this.NITRO_SPEED_MODIFIER;
    this.currentMaxSpeedBackward /= this.NITRO_SPEED_MODIFIER;
    this.currentAccelerationPowerForward /= this.NITRO_ACCELERATION_MODIFIER;
    this.currentAccelerationPowerBackward /= this.NITRO_ACCELERATION_MODIFIER;
    this.isNitroActive = false;
    this.currentRefuelingTimestamp = GameTimeline.now();
    if (onRefuel) {
      GameTimeline.setTimeout(onRefuel, this.NITRO_REFUEL_COOLDOWN);
    }
  }

  addSteeringForce(value: number) {
    this.steeringForce += value;
    if (this.steeringForce > 1) {
      this.steeringForce = 1;
    }
    if (this.steeringForce < -1) {
      this.steeringForce = -1;
    }
  }

  turning(deltaTime: number) {
    const TURNING_THRESHOLD = 10;
    if (Vector.length(this.actualForce) > TURNING_THRESHOLD) {
      const angle =
        (3 * this.steeringForce * (Vector.length(this.actualForce) + this.maxSpeedForward)) /
        (this.maxSpeedForward * 2);
      this.rotate(angle * deltaTime * 60);
    }
  }

  rotate(angle: number) {
    this.angle = PhysicsUtils.normalizeAngle(this.angle + angle);
    this.updateCurrentSprite();
  }

  setPosition(position: Vec2D) {
    this.position = position;
  }

  updateCurrentSprite() {
    this.currentSpriteIndex =
      Math.round(spriteCount - (((this.angle + 270) % 360) / 360) * spriteCount) % spriteCount;
  }

  get displayData(): DisplayData {
    assert(this.sprite, "Sprite is not loaded");

    return {
      sprite: this.sprite,
      position: this.position,
      currentSprite: this.currentSpriteIndex,
    };
  }

  abstract update(deltaTime: number): void;

  get collision(): CollisionObject {
    return {
      x: this.position.x + this.colliderWidth / 2 + 30,
      y: this.position.y + this.colliderHeight / 2 + 15,
      width: this.colliderWidth,
      height: this.colliderHeight,
      angle: this.angle,
    };
  }
}

export default PhysicsBasedController;
