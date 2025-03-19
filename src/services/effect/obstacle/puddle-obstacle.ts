import PlayerController from "@/src/controllers/player-controller";
import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class PuddleObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.PUDDLE);
  }

  /** Slow down the player when entering the puddle */
  override onEnter(car: PhysicsBasedController) {
    console.log("enter");
    // const playerController = PlayerController.currentInstance;
    // if (!playerController) return;
    car.actualForce.x *= 0.3;
    car.actualForce.y *= 0.3;
    car.currentAccelerationPowerForward *= 0.1;
  }

  override onExit(car: PhysicsBasedController) {
    console.log("exit");
    // const playerController = PlayerController.currentInstance;
    // if (!playerController) return;
    car.resetToDefaultSpeedAndAcceleration();
  }
}
