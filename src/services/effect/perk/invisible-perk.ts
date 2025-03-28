import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";
import { TimedEffect } from "../timed-effect-driver";
import GameScene from "@/src/scenes/GameScene";

export default class InvisiblePerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.INVISIBLE);
  }

  override onEnter(car: PhysicsBasedController) {
    if (!GameScene.instance || !GameScene.instance.playerController) return;
    // car.timedEffectDriver.finishEffect("damaged");
    GameScene.instance.opponentControllersList.forEach((opponent) => {
      opponent.invisible = true;
    });
    GameScene.instance.playerController.invisible = true;

    const effect: TimedEffect = {
      canBeOverrided: false,
      startTimestamp: Date.now(),
      duration: 2000,
      finish: () => {
        if (!GameScene.instance || !GameScene.instance.playerController) return;

        GameScene.instance.opponentControllersList.forEach((opponent) => {
          opponent.invisible = false;
        });
        GameScene.instance.playerController.invisible = false;
      },
      update() {},
    };

    // TODO change effect to invisible
    car.timedEffectDriver.addEffect("slip", effect);
  }
}
