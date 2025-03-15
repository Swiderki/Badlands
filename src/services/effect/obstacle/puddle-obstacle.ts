import PlayerController from "@/src/controllers/player-controller";
import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";

export default class PuddleObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.PUDDLE);
  }

  /** Slow down the player when entering the puddle */
  override onEnter() {
    console.log("enter");
    const playerController = PlayerController.currentInstance;
    if (!playerController) return;
    playerController.actualForce.x *= 0.3;
    playerController.actualForce.y *= 0.3;
    playerController.currentAccelerationPowerForward *= 0.1;
  }

  override onExit() {
    console.log("exit");
    const playerController = PlayerController.currentInstance;
    if (!playerController) return;
    playerController.resetToDefaultSpeedAndAcceleration();
  }
}
