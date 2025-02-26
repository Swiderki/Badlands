import { DisplayData, Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";
import { PhysicsUtils } from "../util/physics-util";

const spriteCount = 60;
class PhysicsBasedController {
  protected _sprite: Sprite | null = null;
  protected _currentSprite: number = 0;

  protected _position: Vec2D = { x: 0, y: 0 };
  protected _actualForce: Vec2D = { x: 0, y: 0 };
  protected _velocity: Vec2D = { x: 0, y: 0 };
  protected _acceleration: Vec2D = { x: 0, y: 0 };
  protected _angle: number = 0;

  colliderWidth: number = 2; //* Car width
  colliderHeight: number = 4; //* Car height

  constructor(sprite: Sprite) {
    this._sprite = sprite;

    this.colliderHeight = 20; //sprite.config.spriteHeight;
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

  get actualForce() {
    return this._actualForce;
  }

  set actualForce(force: Vec2D) {
    this._actualForce = force;
  }

  applyForce(magnitude: number) {
    this.acceleration = PhysicsUtils.calculateForceVector(magnitude, this.angle);
  }

  rotate(angle: number) {
    this._angle = PhysicsUtils.normalizeAngle(this._angle + angle);
    this.setCurrentSprite();
  }

  setPosition(position: Vec2D) {
    this._position = position;
  }

  setCurrentSprite() {
    this._currentSprite =
      Math.floor(spriteCount - (((this._angle + 270) % 360) / 360) * spriteCount) % spriteCount;
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
