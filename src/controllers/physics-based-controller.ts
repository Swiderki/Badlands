import { DisplayData, Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";
import { PhysicsUtils } from "../util/physics-util";
import { Vector } from "../util/vec-util";
import { getDeltaTime } from "../util/delta-time";
import { StartPosition } from "@/types/track-driver";

const spriteCount = 60;
class PhysicsBasedController {
  protected _sprite: Sprite | null = null;
  protected _currentSprite: number = 0;

  protected _position: Vec2D = { x: 0, y: 0 };
  protected _actualForce: Vec2D = { x: 0, y: 0 };
  protected _velocity: Vec2D = { x: 0, y: 0 };
  protected _acceleration: Vec2D = { x: 0, y: 0 };
  protected _angle: number = 0;
  protected _brakingForce: number = 0;

  // dodać wartości przyeczpnosci pojazdu, jego przyspieszenia do przodu i do tylu, maksymalna prredkosc do przodu i do tylu, i te wartosci mają być jakoś osobno zapisywane żeby można je łatwo zamienić na wartości domyślne

  protected _maxSpeedForward: number = 400;
  protected _maxSpeedBackwards: number = 250;
  protected _accelerationPowerForward: number = 12;
  protected _accelerationPowerBackwards: number = 8;

  protected _defaultAdhesionModifier: number = 1;
  protected _mapAdhesion: number = 1;

  protected _currentMaxSpeedForward: number = this._maxSpeedForward;
  protected _currentMaxSpeedBackwards: number = this._maxSpeedBackwards;
  protected _currentAccelerationPowerForward: number = this._accelerationPowerForward;
  protected _currentAccelerationPowerBackwards: number = this._accelerationPowerBackwards;
  protected _currentAdhesionModifier: number = this._defaultAdhesionModifier;

  colliderWidth: number = 2; //* Car width
  colliderHeight: number = 4; //* Car height

  constructor(sprite: Sprite) {
    this._sprite = sprite;

    this.colliderHeight = 30; //sprite.config.spriteHeight;
    this.colliderWidth = 14; //sprite.config.spriteWidth;
    this.setCurrentSprite();
  }

  get position() {
    return this._position;
  }

  set position(position: Vec2D) {
    this._position = position;
  }

  get velocity() {
    return this._velocity;
  }

  set velocity(velocity: Vec2D) {
    this._velocity = velocity;
  }

  get acceleration() {
    return this._acceleration;
  }

  set acceleration(acceleration: Vec2D) {
    this._acceleration = acceleration;
  }

  get angle() {
    return this._angle;
  }

  set angle(angle: number) {
    this._angle = angle;
  }

  get brakingForce() {
    return this._brakingForce;
  }

  set brakingForce(brakingForce: number) {
    this._brakingForce = brakingForce;
  }

  get actualForce() {
    return this._actualForce;
  }

  set actualForce(force: Vec2D) {
    this._actualForce = force;
  }

  get mapAdhesion() {
    return this._mapAdhesion;
  }

  set mapAdhesion(n: number) {
    this._mapAdhesion = n;
  }

  get currentMaxSpeedForward(): number {
    return this._currentMaxSpeedForward;
  }

  set currentMaxSpeedForward(value: number) {
    this._currentMaxSpeedForward = value;
  }

  get currentMaxSpeedBackwards(): number {
    return this._currentMaxSpeedBackwards;
  }

  set currentMaxSpeedBackwards(value: number) {
    this._currentMaxSpeedBackwards = value;
  }

  get currentAccelerationPowerForward(): number {
    return this._currentAccelerationPowerForward;
  }

  set currentAccelerationPowerForward(value: number) {
    this._currentAccelerationPowerForward = value;
  }

  get currentAccelerationPowerBackwards(): number {
    return this._currentAccelerationPowerBackwards;
  }

  set currentAccelerationPowerBackwards(value: number) {
    this._currentAccelerationPowerBackwards = value;
  }

  get currentAdhesionModifier(): number {
    return this._currentAdhesionModifier;
  }

  set currentAdhesionModifier(value: number) {
    this._currentAdhesionModifier = value;
  }

  get centerPosition(): Vec2D {
    return {
      x: this._position.x + this.colliderWidth / 2 + 30,
      y: this._position.y + this.colliderHeight / 2 + 15,
    };
  }

  resetToDefaultSpeedAndAcceleration(): void {
    this._currentMaxSpeedForward = this._maxSpeedForward;
    this._currentMaxSpeedBackwards = this._maxSpeedBackwards;
    this._currentAccelerationPowerForward = this._accelerationPowerForward;
    this._currentAccelerationPowerBackwards = this._accelerationPowerBackwards;
  }

  resetToDefaultAdhesionModifier(): void {
    this._currentAdhesionModifier = this._defaultAdhesionModifier;
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
    let diff = Math.abs(Vector.angle(this.actualForce) - this.angle) % 360;
    if (diff > 90 || Vector.length(this.actualForce) === 0) {
      if (Vector.length(this.actualForce) < this.currentMaxSpeedBackwards) {
        this.applyForce(-1 * this.currentAccelerationPowerBackwards);
      }
    } else {
      this.brakingForce = 0.05;
    }
  }

  applyForce(magnitude: number) {
    this.acceleration = Vector.generateVectorFromAngle(magnitude, this.angle);
  }

  enterNitroMode() {
    const nitroModifier = 1.5;
    this.currentMaxSpeedForward = this._maxSpeedForward * nitroModifier;
    this.currentMaxSpeedBackwards = this._maxSpeedBackwards * nitroModifier;
    this.currentAccelerationPowerForward = this._accelerationPowerForward * nitroModifier;
    this.currentAccelerationPowerBackwards = this._accelerationPowerBackwards * nitroModifier;
    // aby wyłączyć nitro służy funkcja resetToDefaultSpeedAndAcceleration()
  }

  turning(value: number) {
    const turningThreshold = 10;
    if (Vector.length(this.actualForce) > turningThreshold) {
      this.rotate(
        (6 * value * (Vector.length(this.actualForce) + this.currentMaxSpeedForward)) /
          (this.currentMaxSpeedForward * 2)
      );
    }
  }

  rotate(angle: number) {
    this._angle = PhysicsUtils.normalizeAngle(this._angle + angle * getDeltaTime() * 60);
    this.setCurrentSprite();
  }

  setPosition(position: Vec2D) {
    this._position = position;
  }

  setCurrentSprite() {
    this._currentSprite =
      Math.round(spriteCount - (((this._angle + 270) % 360) / 360) * spriteCount) % spriteCount;
  }

  get displayData(): DisplayData {
    if (!this._sprite) {
      throw new Error("Sprite is not loaded");
    }

    return {
      sprite: this._sprite,
      position: this._position,
      currentSprite: this._currentSprite,
    };
  }

  update(deltaTime: number) {}
}

export default PhysicsBasedController;
