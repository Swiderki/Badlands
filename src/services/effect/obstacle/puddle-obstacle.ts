import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import PlayerController from "@/src/controllers/player-controller";
import { Vector } from "@/src/util/vec-util";
const audio = new Audio("assets/sounds/puddle.wav");

export default class PuddleObstacle extends EffectObject {
  private readonly FORCE_MODIFIER = 0.4;
  private readonly ACCELERATION_MODIFIER = 0.7;

  constructor(position: Vec2D) {
    super(position, Obstacles.PUDDLE);
  }

  /** Slow down the player when entering the puddle */
  override onEnter(car: PhysicsBasedController) {
    if (Vector.length(car.actualForce) > 80) {
      if (car instanceof PlayerController) audio.play();
      
      car.actualForce.x *= this.FORCE_MODIFIER;
      car.actualForce.y *= this.FORCE_MODIFIER;
      car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;
    }
  }

  override onExit(car: PhysicsBasedController) {
    car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
  }
}
