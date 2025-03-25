import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";
import { TimedEffect } from "../timed-effect-driver";
import GameScene from "@/src/scenes/GameScene";

export default class NoCollisionPerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.NO_COLLISION);
  }

  override onEnter(car: PhysicsBasedController) {
    if (!GameScene.instance || !GameScene.instance.playerController) return;
    // car.timedEffectDriver.finishEffect("damaged");

    car.no_collision = true;

    const effect: TimedEffect = {
      canBeOverrided: false,
      startTimestamp: Date.now(),
      duration: 5000,
      finish: () => {
        if (!GameScene.instance || !GameScene.instance.playerController) return;

        car.no_collision = false;
      },
      update() {},
    };

    // TODO change effect to no_colission
    car.timedEffectDriver.addEffect("slip", effect);
  }
}
