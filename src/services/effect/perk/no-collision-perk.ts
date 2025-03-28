import { Vec2D } from "@/types/physics";
import { Perks } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import EffectObject from "../effect-object";
import { TimedEffect } from "../timed-effect-driver";
import GameScene from "@/src/scenes/GameScene";
import PlayerController from "@/src/controllers/player-controller";
import GameTimeline from "../../game-logic/game-timeline";
const audio = new Audio("assets/sounds/no_collision.wav");

export default class NoCollisionPerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.NO_COLLISION);
  }

  override onEnter(car: PhysicsBasedController) {
    if (!GameScene.instance || !GameScene.instance.playerController) return;
    if (car instanceof PlayerController) audio.play();

    car.noCollision = true;

    const effect: TimedEffect = {
      canBeOverrided: false,
      startTimestamp: GameTimeline.now(),
      duration: 5000,
      finish: () => {
        if (!GameScene.instance || !GameScene.instance.playerController) return;

        car.noCollision = false;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("no-collision", effect);
  }
}
