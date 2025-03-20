import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class SpikesObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.SPIKES);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.actualForce.x *= 0.2;
    car.actualForce.y *= 0.2;
    car.currentMaxSpeedForward *= 0.2;
    car.currentAccelerationPowerForward *= 0.7;

    setTimeout(() => {
      car.actualForce.x *= 0.1;
      car.actualForce.y *= 0.1;
    }, 200);

    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: Infinity,
      finish() {
        // playerController.resetToDefaultSpeedAndAcceleration();
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("damaged", effect);
  }
}
