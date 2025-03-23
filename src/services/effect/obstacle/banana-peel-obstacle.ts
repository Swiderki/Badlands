import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class BananaPeelObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.BANANA_PEEL);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    // playerController.currentAdhesionModifier *= 0.002;

    // TODO: niech ktos madry zrobi tak zeby autko tracilo grip pls
    // TODO: Zostawiłbym w bananie ten smieszny skręt bo to w sumie pasuje do komizmu skórki od banana
    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: Date.now(),
      duration: 700,
      finish() {},
      update() {
        car.rotate(-2);
      },
    };

    car.timedEffectDriver.addEffect("slip", effect);
  }
}
