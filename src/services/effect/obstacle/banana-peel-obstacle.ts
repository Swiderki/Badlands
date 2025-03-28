import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";
import PlayerController from "@/src/controllers/player-controller";
const audio = new Audio("assets/sounds/banan.wav");

export default class BananaPeelObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.BANANA_PEEL);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    // playerController.currentAdhesionModifier *= 0.002;

    if (car instanceof PlayerController) audio.play();

    // TODO: niech ktos madry zrobi tak zeby autko tracilo grip pls
    // TODO: Zostawiłbym w bananie ten smieszny skręt bo to w sumie pasuje do komizmu skórki od banana
    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: 700,
      finish() {},
      update() {
        car.rotate(-2);
      },
    };

    car.timedEffectDriver.addEffect("slip", effect);
  }
}
