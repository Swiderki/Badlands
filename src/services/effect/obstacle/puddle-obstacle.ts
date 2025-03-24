import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class PuddleObstacle extends EffectObject {
  private readonly FORCE_MODIFIER = 0.3;
  private readonly ACCELERATION_MODIFIER = 0.1;

  constructor(position: Vec2D) {
    super(position, Obstacles.PUDDLE);
  }

  /** Slow down the player when entering the puddle */
  override onEnter(car: PhysicsBasedController) {
    console.log("enter");
    // const playerController = PlayerController.currentInstance;
    // if (!playerController) return;
    car.actualForce.x *= this.FORCE_MODIFIER;
    car.actualForce.y *= this.FORCE_MODIFIER;
    car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;
  }

  override onExit(car: PhysicsBasedController) {
    console.log("exit");
    // const playerController = PlayerController.currentInstance;
    // if (!playerController) return;
    car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
  }
}
