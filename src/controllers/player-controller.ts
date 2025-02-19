import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";

class PlayerController extends PhysicsBasedController {
  private _playerInput: { [key: string]: boolean } = {};
  private _lastRotation: number = 0;
  private _rotationCooldown: number = 0.25;

  constructor(sprite: Sprite) {
    super(sprite);

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
    if (this.getInput("ArrowUp")) {
      this.applyForce(15);
    }
    this._lastRotation += deltaTime;

    if (this.getInput("ArrowRight") && this._lastRotation >= this._rotationCooldown) {
      this.rotate(45);
      this._lastRotation = 0;
    }

    if (this.getInput("ArrowLeft") && this._lastRotation >= this._rotationCooldown) {
      this.rotate(-45);
      this._lastRotation = 0;
    }
  }
}

export default PlayerController;
