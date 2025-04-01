import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import PlayerController from "@/src/controllers/player-controller";
import { Obstacles } from "@/src/util/effects-utils";
import { Vec2D } from "@/types/physics";
import EffectObject from "../effect-object";
import { UIService } from "../../ui-service/ui-service";
import { usePauseContext } from "@/src/context/pauseContext";

export default class DialogTrigger extends EffectObject {
  private _text: string = "Hello!";
  private _action: () => void = () => {};

  constructor(position: Vec2D, width: number, angle: number, text: string, action: () => void) {
    super(position, Obstacles.NONE);
    this.collision.angle = angle;
    this.collision.width = width;
    this._text = text;
    this._action = action;
  }

  override onEnter(car: PhysicsBasedController) {
    if (!(car instanceof PlayerController)) return;
    this._action();
    UIService.getInstance().displayTutorialText(this._text);
    const pauseContext = usePauseContext();
    pauseContext.pauseGame("gameLogic", true);
  }
}
