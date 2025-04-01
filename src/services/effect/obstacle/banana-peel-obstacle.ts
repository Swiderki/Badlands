import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";
import PlayerController from "@/src/controllers/player-controller";
const audio = new Audio("assets/sounds/banana.wav");

export default class BananaPeelObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.BANANA_PEEL);
  }

  override onEnter(car: PhysicsBasedController) {
    if (car instanceof PlayerController) audio.play();

    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: 700,
      finish() {},
      update(deltaTime) {
        car.rotate(-300 * deltaTime);
      },
    };

    car.timedEffectDriver.addEffect("slip", effect);
  }
}
