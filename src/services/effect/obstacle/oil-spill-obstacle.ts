import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";

export default class OilSpillObstacle extends EffectObject {
  private readonly ADHESION_MODIFIER = 0.002;

  constructor(position: Vec2D) {
    super(position, Obstacles.OIL_SPILL);
  }

  override onEnter(car: PhysicsBasedController) {
    // const playerController = PlayerController.currentInstance;
    // const timedEffectDriver = TimedEffectDriver.currentInstance;
    // if (!timedEffectDriver) return;

    car.currentAdhesionModifier *= this.ADHESION_MODIFIER;

    // TODO: niech ktos madry zrobi tak zeby autko tracilo grip pls
    const effect: TimedEffect = {
      canBeOverrided: true,
      startTimestamp: GameTimeline.now(),
      duration: 700,
      finish: () => {
        car.currentAdhesionModifier /= this.ADHESION_MODIFIER;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect("slip", effect);
  }
}
