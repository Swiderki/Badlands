import PlayerController from "@/src/controllers/player-controller";
import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import TimedEffectDriver, { TimedEffect } from "../timed-effect-driver";

export default class OilSpillObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.OIL_SPILL);
  }

  override onEnter() {
    const playerController = PlayerController.currentInstance;
    const timedEffectDriver = TimedEffectDriver.currentInstance;
    if (!playerController || !timedEffectDriver) return;

    playerController.currentAdhesionModifier *= 0.002;

    // TODO: niech ktos madry zrobi tak zeby autko tracilo grip pls
    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: 700,
      finish() {
        playerController.resetToDefaultAdhesionModifier();
      },
      update() {},
    };

    timedEffectDriver.addEffect("slip", effect);
  }
}
