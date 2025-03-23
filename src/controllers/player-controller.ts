import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";
import { StartPosition } from "@/types/track-driver";
import { getEffectObjectByName, getRandomObstacleSprite } from "../util/effects-utils";

class PlayerController extends PhysicsBasedController {
  private static _instance: PlayerController;
  private _playerInput: { [key: string]: boolean } = {};
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.02;
  private _lastAcceleration: number = 0;
  private _accelerationCooldown: number = 0.2;
  private _lastBrake: number = 0;
  private _brakeCooldown: number = 0.04;
  private _lastObstacleDropTimestamp: number = -1;
  private readonly OBSTACLE_DROP_COOLDOWN = 3000;
  finished = false;
  finishedTime = 0;

  constructor(sprite: Sprite, startPosition: StartPosition) {
    super(sprite);
    this.setPosition(startPosition.position);
    this.angle = startPosition.angle;

    this.setCurrentSprite();

    this._addInputListeners();
    PlayerController._instance = this;
  }

  static get currentInstance(): PlayerController | null {
    if (!PlayerController._instance) {
      return null;
    }
    return PlayerController._instance;
  }

  /** @returns what fraction of obstacle drop was recovered (value between 0 - unrecovered and 1 - fully recovered) */
  get obstacleDropLoadFraction() {
    return Math.min(1, (Date.now() - this._lastObstacleDropTimestamp) / this.OBSTACLE_DROP_COOLDOWN);
  }

  private _addInputListeners() {
    document.addEventListener("keydown", (e) => {
      //console.log(this._playerInput);
      this._playerInput[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
      this._playerInput[e.key.toLowerCase()] = false;
    });
  }

  private getInput(key: string): boolean {
    return this._playerInput[key] || false;
  }

  dropObstacle() {
    if (this._lastObstacleDropTimestamp + this.OBSTACLE_DROP_COOLDOWN > Date.now()) {
      return;
    }

    const sprite = getRandomObstacleSprite();
    const EffectObject = getEffectObjectByName(sprite);

    const angleInRad = (this.angle * Math.PI) / 180;
    const someMagicalValue = 0.5 as const;
    const largerDimension = Math.max(this._sprite!.config.spriteHeight, this._sprite!.config.spriteWidth);
    const positionBehindCar = {
      x: this.centerPosition.x - Math.cos(angleInRad) * largerDimension * someMagicalValue,
      y: this.centerPosition.y - Math.sin(angleInRad) * largerDimension * someMagicalValue,
    };

    const obstacle = new EffectObject(positionBehindCar);
    this._lastObstacleDropTimestamp = Date.now();
    return obstacle;
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
    if (this.getInput("arrowup") || this.getInput("w")) {
      this.accelerateForward();
      this._lastAcceleration = 0;
    }

    if ((this.getInput("arrowright") || this.getInput("d")) && this._lastRotation >= this._rotationCooldown) {
      this.isTurning = true;
      this.addSteeringForce(0.2);
      this._lastRotation = 0;
    }

    if ((this.getInput("arrowleft") || this.getInput("a")) && this._lastRotation >= this._rotationCooldown) {
      this.isTurning = true;
      this.addSteeringForce(-0.2);
      this._lastRotation = 0;
    }
    //if ((this.getInput("ArrowDown") || this.getInput("s")) && this._lastBrake >= this._brakeCooldown) {
    if (this.getInput("arrowdown") || this.getInput("s")) {
      this.brake();
      this._lastBrake = 0;
    }
  }
}

export default PlayerController;
