import { Sprite } from "@/types/display-driver";
import PhysicsBasedController from "./physics-based-controller";

class PlayerController extends PhysicsBasedController {
  private _playerInput: { [key: string]: boolean } = {};

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
    if (this.getInput("ArrowUp")) {
      this.applyForce(15);
    }
    if (this.getInput("ArrowRight")) {
      this.rotate(3);
    }
    if (this.getInput("ArrowLeft")) {
      this.rotate(-3);
    }
  }
}

export default PlayerController;
