import { Vector } from "@/src/util/vec-util";
import { DisplayData, Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";

class PhysicsBasedController {
  protected _sprite: Sprite | null = null;
  //* Current sprite should be calculated based of the direction of the velocity
  //! THIS SHOULD ONLY HAPPEN IN THE CHILD CLASS
  //* That's why it doesn't have a setter & getter
  protected _currentSprite: number = 0;

  protected _position: Vec2D = { x: 0, y: 0 };
  protected _velocity: Vec2D = { x: 0, y: 0 };
  protected _acceleration: Vec2D = { x: 0, y: 0 };

  constructor(sprite: Sprite) {
    this._sprite = sprite;
  }

  get sprite() {
    return this._sprite;
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

  applyForce(force: Vec2D) {
    this._acceleration = Vector.add(this._acceleration, force);
  }

  setPosition(position: Vec2D) {
    this._position = position;
  }

  get displayData(): DisplayData {
    if (!this.sprite) {
      throw new Error("Sprite is not loaded");
    }

    return {
      sprite: this.sprite,
      position: this.position,
      currentSprite: this._currentSprite,
    };
  }

  update(deltaTime: number): void {}
}

export default PhysicsBasedController;
