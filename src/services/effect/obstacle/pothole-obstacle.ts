import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import  { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class PotholeObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.POTHOLE);
  }

  /** Slow down the player when entering the hole and due to car damage it acceleration is reduced */
  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.actualForce.x *= 0.1;
    car.actualForce.y *= 0.1;
    car.currentAccelerationPowerForward *= 0.9;
    car.currentMaxSpeedForward *= 0.6;

    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: Infinity,
      finish() {
        car.resetToDefaultSpeedAndAcceleration();
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("damaged", effect);
  }
}
