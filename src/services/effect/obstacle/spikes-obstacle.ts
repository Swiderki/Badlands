import PlayerController from "@/src/controllers/player-controller";
import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import TimedEffectDriver, { TimedEffect } from "../timed-effect-driver";

export default class SpikesObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.SPIKES);
  }

  override onEnter() {
    const playerController = PlayerController.currentInstance;
    const timedEffectDriver = TimedEffectDriver.currentInstance;
    if (!playerController || !timedEffectDriver) return;

    playerController.actualForce.x *= 0.2;
    playerController.actualForce.y *= 0.2;
    playerController.currentMaxSpeedForward *= 0.2;
    playerController.currentAccelerationPowerForward *= 0.7;

    setTimeout(() => {
      playerController.actualForce.x *= 0.1;
      playerController.actualForce.y *= 0.1;
    }, 200);

    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: Infinity,
      finish() {
        // playerController.resetToDefaultSpeedAndAcceleration();
      },
      update() {},
    };

    timedEffectDriver.addEffect("damaged", effect);
  }
}
