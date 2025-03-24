import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
// import PerkObject from "./perk-object";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";

export default class BoostPerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.BOOST_STAR);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.currentAccelerationPowerForward *= 2;
    car.currentAccelerationPowerBackwards *= 2;

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: Date.now(),
      duration: 5000,
      finish() {
        car.resetToDefaultSpeedAndAcceleration();
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("boost", effect);
  }
}
