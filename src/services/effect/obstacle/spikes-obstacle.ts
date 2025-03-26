import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";

export default class SpikesObstacle extends EffectObject {
  private readonly FORCE_MODIFIER = 0.2;
  private readonly ACCELERATION_MODIFIER = 0.7;

  constructor(position: Vec2D) {
    super(position, Obstacles.SPIKES);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.actualForce.x *= this.FORCE_MODIFIER;
    car.actualForce.y *= this.FORCE_MODIFIER;
    car.currentMaxSpeedForward *= this.FORCE_MODIFIER;
    car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: Infinity,
      finish: () => {
        car.currentMaxSpeedForward /= this.FORCE_MODIFIER;
        car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("damaged", effect);
  }
}
