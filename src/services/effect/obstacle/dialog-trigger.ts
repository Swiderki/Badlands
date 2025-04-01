import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import PlayerController from "@/src/controllers/player-controller";
import { Obstacles } from "@/src/util/effects-utils";
import { Vec2D } from "@/types/physics";
import EffectObject from "../effect-object";
import { UIService } from "../../ui-service/ui-service";
import Game from "../../game";
const audio = new Audio("assets/sounds/spikes.wav");

export default class DialogTrigger extends EffectObject {
  private _text: string = "Hello!";

  constructor(position: Vec2D, width: number, angle: number, text: string) {
    super(position, Obstacles.NONE);
    this.collision.angle = angle;
    this.collision.width = width;
    this._text = text;
  }

  override onEnter(car: PhysicsBasedController) {
    if (!(car instanceof PlayerController)) return;
    UIService.getInstance().displayTutorialText(this._text);
    Game.getInstance().pauseGame(true);
  }
}
