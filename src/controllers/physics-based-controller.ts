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
  mapAdhesion: number = 0.9;

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

  tracePaths: { left: Path2D; right: Path2D } = { left: new Path2D(), right: new Path2D() };
  traceTimestamps: {
    left: { position: Vec2D; timestamp: number; alpha?: number }[];
    right: { position: Vec2D; timestamp: number; alpha?: number }[];
  } = { left: [], right: [] };
  private readonly TRACE_INTERVAL = 100; // ms
  private _lastTraceTimestamp = 0;

  constructor(sprite: Sprite) {
    this.sprite = sprite;

    this.colliderHeight = 30;
    this.colliderWidth = 14;
    this.updateCurrentSprite();
  }

  get centerPosition(): Vec2D {
    // Debugging center position
    const center = {
      x: this.position.x + this.colliderWidth / 2 + 30,
      y: this.position.y + this.colliderHeight / 2 + 15,
    };
    return center;
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

  update(deltaTime: number): void {
    const now = GameTimeline.now();

    // Update trace paths if enough time has passed
    if (now - this._lastTraceTimestamp >= this.TRACE_INTERVAL) {
      this.updateTracePaths(now);
      this._lastTraceTimestamp = now;
    }

    // Remove old trace points and rebuild paths if necessary
    this.cleanupOldTraces(now);

    // Update alpha values for fading effect
    this.updateTraceAlphas(now);
  }

  private updateTracePaths(now: number): void {
    const [leftWheel, rightWheel] = this.getWheelsPosition();

    if (this.traceTimestamps.left.length === 0) {
      this.tracePaths.left.moveTo(leftWheel.x, leftWheel.y);
      this.tracePaths.right.moveTo(rightWheel.x, rightWheel.y);
    } else {
      this.tracePaths.left.lineTo(leftWheel.x, leftWheel.y);
      this.tracePaths.right.lineTo(rightWheel.x, rightWheel.y);
    }

    this.traceTimestamps.left.push({ position: leftWheel, timestamp: now });
    this.traceTimestamps.right.push({ position: rightWheel, timestamp: now });
  }

  private cleanupOldTraces(now: number): void {
    const MAX_TRACE_AGE = 2000; // ms

    const filterOldTraces = (traces: { position: Vec2D; timestamp: number; alpha?: number }[]) =>
      traces.filter((trace) => now - trace.timestamp <= MAX_TRACE_AGE);

    const initialLeftLength = this.traceTimestamps.left.length;
    const initialRightLength = this.traceTimestamps.right.length;

    this.traceTimestamps.left = filterOldTraces(this.traceTimestamps.left);
    this.traceTimestamps.right = filterOldTraces(this.traceTimestamps.right);

    if (initialLeftLength !== this.traceTimestamps.left.length) {
      this.rebuildPath(this.tracePaths.left, this.traceTimestamps.left);
    }
    if (initialRightLength !== this.traceTimestamps.right.length) {
      this.rebuildPath(this.tracePaths.right, this.traceTimestamps.right);
    }
  }

  private updateTraceAlphas(now: number): void {
    const MAX_TRACE_AGE = 2000; // ms

    const calculateAlpha = (traces: { position: Vec2D; timestamp: number; alpha?: number }[]) =>
      traces.forEach((trace, index) => {
        const age = now - trace.timestamp;
        const alpha = Math.max(0, 1 - age / MAX_TRACE_AGE); // Linear fade-out over MAX_TRACE_AGE
        traces[index] = { ...trace, alpha };
      });

    calculateAlpha(this.traceTimestamps.left);
    calculateAlpha(this.traceTimestamps.right);
  }

  private getWheelsPosition(): [Vec2D, Vec2D] {
    const angleRad = (this.angle * Math.PI) / 180;
    const halfWidth = this.colliderWidth / 2;
    console.log(this.colliderWidth);
    const offsetX = halfWidth * Math.sin(angleRad);
    const offsetY = halfWidth * (Math.cos(angleRad) * -1);

    const X_MAGIC_OFFSET = 1;
    const Y_MAGIC_OFFSET = 7;

    const leftWheel = {
      x: this.centerPosition.x - offsetX + X_MAGIC_OFFSET,
      y: this.centerPosition.y - offsetY + Y_MAGIC_OFFSET,
    };

    const rightWheel = {
      x: this.centerPosition.x + offsetX + X_MAGIC_OFFSET,
      y: this.centerPosition.y + offsetY + Y_MAGIC_OFFSET,
    };

    return [leftWheel, rightWheel];
  }

  private rebuildPath(path: Path2D, traces: { position: Vec2D; timestamp: number }[]) {
    const newPath = new Path2D();
    if (traces.length > 0) {
      newPath.moveTo(traces[0].position.x, traces[0].position.y);
      for (let i = 1; i < traces.length; i++) {
        newPath.lineTo(traces[i].position.x, traces[i].position.y);
      }
    }
    Object.assign(path, newPath);
  }

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
