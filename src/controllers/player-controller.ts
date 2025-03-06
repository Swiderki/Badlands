import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";
import { StartPosition } from "@/types/track-driver";

class PlayerController extends PhysicsBasedController {
  private _playerInput: { [key: string]: boolean } = {};
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.02;
  private _lastAcceleration: number = 0;
  private _accelerationCooldown: number = 0.2;
  private _lastBrake: number = 0;
  private _brakeCooldown: number = 0.04;

  constructor(sprite: Sprite, startPosition: StartPosition) {
    super(sprite);
    this.setPosition(startPosition.position);
    this.angle = startPosition.angle;

    this.setCurrentSprite();

    this._addInputListeners();
  }

  private _addInputListeners() {
    document.addEventListener("keydown", (e) => {
      //console.log(this._playerInput);
      this._playerInput[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this._playerInput[e.key] = false;
    });
  }

  private getInput(key: string): boolean {
    return this._playerInput[key] || false;
  }

  override update(deltaTime: number) {
    //* This one is just for testing purposes
    // console.log(deltaTime);
    // console.log(this._lastRotation);

    this._lastRotation += deltaTime;
    this._lastAcceleration += deltaTime;
    this._lastBrake += deltaTime;

    /*if (
      (this.getInput("ArrowUp") || this.getInput("w")) &&
      this._lastAcceleration >= this._accelerationCooldown
    )*/
    if (this.getInput("ArrowUp") || this.getInput("w")) {
      this.accelerateForward();
      this._lastAcceleration = 0;
    }

    if ((this.getInput("ArrowRight") || this.getInput("d")) && this._lastRotation >= this._rotationCooldown) {
      this.turning(1);
      this._lastRotation = 0;
    }

    if ((this.getInput("ArrowLeft") || this.getInput("a")) && this._lastRotation >= this._rotationCooldown) {
      this.turning(-1);
      this._lastRotation = 0;
    }
    //if ((this.getInput("ArrowDown") || this.getInput("s")) && this._lastBrake >= this._brakeCooldown) {
    if (this.getInput("ArrowDown") || this.getInput("s")) {
      this.brake();
      this._lastBrake = 0;
    }
  }
}

export default PlayerController;
