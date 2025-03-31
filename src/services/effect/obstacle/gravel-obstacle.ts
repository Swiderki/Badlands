import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Vector } from "@/src/util/vec-util";
import { Obstacles } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class GravelObstacle extends EffectObject {
  private readonly ADHESION_MODIFIER = 0.02;

  constructor(position: Vec2D) {
    super(position, Obstacles.GRAVEL);
  }

  override onEnter(car: PhysicsBasedController) {
    car.currentAdhesionModifier *= this.ADHESION_MODIFIER;
  }

  override onColliding(car: PhysicsBasedController) {
    if (Vector.length(car.actualForce) > 0) {
      car.rotate((Math.random() + -0.5) * 10);
    }
  }

  override onExit(car: PhysicsBasedController) {
    car.currentAdhesionModifier /= this.ADHESION_MODIFIER;
  }
}
