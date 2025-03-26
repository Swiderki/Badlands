import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";

export default class PotholeObstacle extends EffectObject {
  private readonly FORCE_MODIFIER = 0.1;
  private readonly ACCELERATION_MODIFIER = 0.9;
  private readonly MAX_SPEED_MODIFIER = 0.6;

  constructor(position: Vec2D) {
    super(position, Obstacles.POTHOLE);
  }

  /** Slow down the player when entering the hole and due to car damage it acceleration is reduced */
  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.actualForce.x *= this.FORCE_MODIFIER;
    car.actualForce.y *= this.FORCE_MODIFIER;
    car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;
    car.currentMaxSpeedForward *= this.MAX_SPEED_MODIFIER;

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: Infinity,
      finish: () => {
        car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
        car.currentMaxSpeedForward /= this.MAX_SPEED_MODIFIER;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("damaged", effect);
  }
}
