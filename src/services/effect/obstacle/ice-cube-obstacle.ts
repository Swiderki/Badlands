import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Perks } from "@/src/util/effects-utils";
import { Vec2D } from "@/types/physics";
import GameTimeline from "../../game-logic/game-timeline";
import EffectObject from "../effect-object";
import { TimedEffect } from "../timed-effect-driver";
import PlayerController from "@/src/controllers/player-controller";
const audio = new Audio("assets/sounds/icecube.wav");

export default class IceCubeObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.ICE_CUBE);
  }

  override onEnter(car: PhysicsBasedController) {
    if (car instanceof PlayerController) audio.play();

    const oldMaxSpeed = car.currentMaxSpeedForward;
    const oldMaxSpeedBackward = car.currentMaxSpeedBackward;
    car.currentMaxSpeedForward = 0;
    car.currentMaxSpeedBackward = 0;
    car.actualForce = { x: 0, y: 0 };

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: 1000,
      finish: () => {
        car.currentMaxSpeedForward = oldMaxSpeed;
        car.currentMaxSpeedBackward = oldMaxSpeedBackward;
      },
      update() {},
    };
    car.timedEffectDriver.addEffect("freeze", effect);
  }
}
