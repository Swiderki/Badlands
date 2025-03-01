import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";
import { StartPosition } from "@/types/track-driver";
import DrivingPolicyBase from "./driving-policies/base-driving-policy";

class OpponentController extends PhysicsBasedController {
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.04;
  private _lastAcceleration: number = 0;
  private _accelerationCooldown: number = 0.2;
  private _lastBrake: number = 0;
  private _brakeCooldown: number = 0.04;

  private _drivingPolicy: DrivingPolicyBase

  constructor(sprite: Sprite, startPosition: StartPosition, drivingPolicy: DrivingPolicyBase) {
    super(sprite);

    // Temporary, bacause he cant deal with greater values
    this._currentMaxSpeedForward = 50;

    this.setPosition(startPosition.position);
    this.angle = startPosition.angle;
    this.setCurrentSprite();
    this._drivingPolicy = drivingPolicy
  }

  override update(deltaTime: number) {

    this._lastRotation += deltaTime;
    this._lastAcceleration += deltaTime;
    this._lastBrake += deltaTime;

    //* Offset for x and y +30 and +15 is added for the same reason like in collision-util.ts
    const action = this._drivingPolicy.getAction({x: this.position.x + this.colliderWidth/2 + 30, y: this.position.y + this.colliderHeight/2 + 15}, this.angle);

    if (action.acceleration && this._lastAcceleration >= this._accelerationCooldown) {
      this.accelerateForward();
      this._lastAcceleration = 0;
    }
    if (action.rotation && this._lastRotation >= this._rotationCooldown) {
      this.rotate(action.rotation);
      this._lastRotation = 0;
    }
    if (action.brake && this._lastBrake >= this._brakeCooldown) {
      this.brake();
      this._lastBrake = 0;
    }
  }
}

export default OpponentController;
