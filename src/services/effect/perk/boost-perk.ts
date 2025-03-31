import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";
import GameTimeline from "../../game-logic/game-timeline";
import PlayerController from "@/src/controllers/player-controller";
const audio = new Audio("assets/sounds/boost.wav");

export default class BoostPerk extends EffectObject {
  private readonly ACCELERATION_MODIFIER = 2;

  constructor(position: Vec2D) {
    super(position, Perks.BOOST_STAR);
  }

  override onEnter(car: PhysicsBasedController) {
    if (car instanceof PlayerController) audio.play();
    car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;
    car.currentAccelerationPowerBackward *= this.ACCELERATION_MODIFIER;

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: 5000,
      finish: () => {
        car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
        car.currentAccelerationPowerBackward /= this.ACCELERATION_MODIFIER;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("boost", effect);
  }
}
