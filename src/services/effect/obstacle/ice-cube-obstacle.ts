import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles, Perks } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class IceObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.ICE_CUBE);
  }

  override onEnter(car: PhysicsBasedController) {
    const oldMaxSpeed = car.currentMaxSpeedForward;
    const oldMaxSpeedBackward = car.currentMaxSpeedBackwards;
    car.currentMaxSpeedForward = 0;
    car.currentMaxSpeedBackwards = 0;
    car.actualForce = { x: 0, y: 0 };

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: Date.now(),
      duration: 1000,
      finish: () => {
        car.currentMaxSpeedForward = oldMaxSpeed;
        car.currentMaxSpeedBackwards = oldMaxSpeedBackward;
      },
      update() {},
    };
    // TODO change effect to freeze
    car.timedEffectDriver.addEffect("slip", effect);
  }
}
