import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import  { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class OilSpillObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.OIL_SPILL);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.currentAdhesionModifier *= 0.002;

    // TODO: niech ktos madry zrobi tak zeby autko tracilo grip pls
    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: 700,
      finish() {
        car.resetToDefaultAdhesionModifier();
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("slip", effect);
  }
}
