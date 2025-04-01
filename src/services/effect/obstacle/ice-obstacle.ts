import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";

export default class IceObstacle extends EffectObject {
  private readonly ADHESION_MODIFIER = 0.5;

  constructor(position: Vec2D) {
    super(position, Obstacles.ICE);
  }

  override onEnter(car: PhysicsBasedController) {
    car.currentAdhesionModifier *= this.ADHESION_MODIFIER;
  }

  override onExit(car: PhysicsBasedController) {
    car.currentAdhesionModifier /= this.ADHESION_MODIFIER;
  }
}
