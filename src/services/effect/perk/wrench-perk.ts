import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";
import PlayerController from "@/src/controllers/player-controller";
const audio = new Audio("assets/sounds/wrench.wav");

export default class WrenchPerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.WRENCH);
  }

  override onEnter(car: PhysicsBasedController) {
    if (car instanceof PlayerController) audio.play();
    car.timedEffectDriver.finishEffect("damaged");
  }
}
