import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";
import { StartPosition } from "@/types/track-driver";
import { getEffectObjectByName, getRandomObstacleSprite } from "../util/effects-utils";
import { UIService } from "../services/ui-service/ui-service";
import GameTimeline from "../services/game-logic/game-timeline";
import { Vector } from "../util/vec-util";
import Scene from "../scenes/_scene";
const audio = new Audio("assets/sounds/horn.wav");

class PlayerController extends PhysicsBasedController {
  private static _instance: PlayerController;
  private _playerInput: { [key: string]: boolean } = {};
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.02;
  private _lastAcceleration: number = 0;
  private _lastBrake: number = 0;
  private _lastObstacleDropTimestamp: number = -1;
  private readonly OBSTACLE_DROP_COOLDOWN = 3000;
  finished = false;
  finishedTime = 0;
  bestLoopTime = 0;

  constructor(sprite: Sprite, startPosition: StartPosition, traction: number) {
    super(sprite, traction);
    this.setPosition(Vector.subtract(startPosition.position, { x: 30, y: 15 }));
    this.angle = startPosition.angle;
    this.currentMaxSpeedForward = 240;
    this.accelerationPowerForward = 240;

    this.updateCurrentSprite();

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
    return Math.min(1, (GameTimeline.now() - this._lastObstacleDropTimestamp) / this.OBSTACLE_DROP_COOLDOWN);
  }

  initListeners(addRemovableListener: Scene["addRemovableListener"]) {
    addRemovableListener(document, "keydown", (e) => {
      this._playerInput[e.key.toLowerCase()] = true;
      if (e.key === "Shift") {
        UIService.getInstance().setIsNitroIndicatorActive(false);
        const onRefuel = () => UIService.getInstance().setIsNitroIndicatorActive(true);
        this.enterNitroMode(onRefuel);
      }
    });

    addRemovableListener(document, "keyup", (e) => {
      this._playerInput[e.key.toLowerCase()] = false;
    });
  }

  private getInput(key: string): boolean {
    return this._playerInput[key] || false;
  }

  dropObstacle() {
    if (this._lastObstacleDropTimestamp + this.OBSTACLE_DROP_COOLDOWN > GameTimeline.now()) {
      return;
    }

    const sprite = getRandomObstacleSprite();
    const EffectObject = getEffectObjectByName(sprite);

    const angleInRad = (this.angle * Math.PI) / 180;
    const someMagicalValue = 0.5 as const;
    const largerDimension = Math.max(this.sprite!.config.spriteHeight, this.sprite!.config.spriteWidth);
    const positionBehindCar = {
      x: this.centerPosition.x - Math.cos(angleInRad) * largerDimension * someMagicalValue,
      y: this.centerPosition.y - Math.sin(angleInRad) * largerDimension * someMagicalValue,
    };

    const obstacle = new EffectObject(positionBehindCar);
    this._lastObstacleDropTimestamp = GameTimeline.now();
    return obstacle;
  }

  override update(deltaTime: number) {
    super.update(deltaTime);

    //* This one is just for testing purposes

    this._lastRotation += deltaTime;
    this._lastAcceleration += deltaTime;
    this._lastBrake += deltaTime;

    if (this.getInput("arrowup") || this.getInput("w")) {
      if (
        Vector.length(this.actualForce) < 0.8 * this.currentMaxSpeedForward &&
        this._lastAcceleration >= 0.4
      ) {
        const audio = new Audio("assets/sounds/gas.wav");
        audio.volume = 0.4;
        audio.play();
        this._lastAcceleration = 0;
      }
      this.accelerateForward();
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
    if (this.getInput("arrowdown") || this.getInput("s")) {
      this.brake();
      this._lastBrake = 0;
    }
    if (this.getInput("k")) {
      audio.volume = 0.2;
      audio.play();
    }
  }
}

export default PlayerController;
