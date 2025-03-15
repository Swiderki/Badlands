import PlayerController from "@/src/controllers/player-controller";
import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import TimedEffectDriver, { TimedEffect } from "../timed-effect-driver";
import PerkObject from "./perk-object";

export default class BoostPerk extends PerkObject {
  constructor(position: Vec2D) {
    super(position, Perks.BOOST_STAR);
  }

  override onEnter() {
    const playerController = PlayerController.currentInstance;
    const timedEffectDriver = TimedEffectDriver.currentInstance;
    if (!playerController || !timedEffectDriver) return;

    playerController.currentAccelerationPowerForward *= 2;
    playerController.currentAccelerationPowerForward *= 2;

    const effect: TimedEffect = {
      startTimestamp: Date.now(),
      duration: 5000,
      finish() {
        playerController.resetToDefaultSpeedAndAcceleration();
      },
      update() {},
    };

    timedEffectDriver.addEffect("boost", effect);
  }
}
