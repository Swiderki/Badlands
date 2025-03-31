import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";
import { StartPosition } from "@/types/track-driver";
import DrivingPolicyBase from "./driving-policies/base-driving-policy";
import Game from "../services/game";
import DisplayDriver from "../services/display-driver/display-driver";
import { Vector } from "../util/vec-util";
import GameScene from "../scenes/game-scene";
import { Scoreboard } from "../services/scoreboard/scoreboard";

class OpponentController extends PhysicsBasedController {
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.04;
  private _lastAcceleration: number = 0;
  private _accelerationCooldown: number = 0.00;
  private _lastBrake: number = 0;
  private _brakeCooldown: number = 0.02;
  drivingPolicy: DrivingPolicyBase;
  nickname: string;
  finished = false;
  finishedTime = 0;
  currentLap = 0;

  constructor(
    sprite: Sprite,
    startPosition: StartPosition,
    drivingPolicy: DrivingPolicyBase,
    nickname: string,
    traction: number
  ) {
    super(sprite, traction);

    // Temporary, bacause he cant deal with greater values
    this.currentMaxSpeedForward = 200;
    this.accelerationPowerForward = 80;

    this.angle = startPosition.angle;
    this.updateCurrentSprite();
    this.drivingPolicy = drivingPolicy;
    this.drivingPolicy.parentRef = this;
    this.setPosition(Vector.subtract(this.drivingPolicy.enemyPath.sampledPoints[0].point, { x: 30, y: 15 }));
    this.nickname = nickname;
  }

  override update(deltaTime: number) {
    super.update(deltaTime);
    this._lastRotation += deltaTime;
    this._lastAcceleration += deltaTime;
    this._lastBrake += deltaTime;

    //* Offset for x and y +30 and +15 is added for the same reason like in @/src/util/collision-util.ts
    const action = this.drivingPolicy.getAction(
      { x: this.position.x + this.colliderWidth / 2 + 30, y: this.position.y + this.colliderHeight / 2 + 15 },
      this.angle,
      this.actualForce
    );

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

    if (this.currentLap >= 3) {
      this.finished = true;
      this.finishedTime = Scoreboard.instance.currentTime;

      if (
        GameScene.instance.opponentControllersList.every((opponent) => opponent.finished) &&
        GameScene.instance.playerController!.finished
      ) {
        Game.getInstance().startResultScene();
      }
    }
  }
}

export default OpponentController;
