import EffectObject from "../effect-object";
import { Vec2D } from "@/types/physics";
import { Obstacles } from "@/src/util/effects-utils";
import { TimedEffect } from "../timed-effect-driver";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameTimeline from "../../game-logic/game-timeline";
import PlayerController from "@/src/controllers/player-controller";
import { Vector } from "@/src/util/vec-util";
const audio = new Audio("assets/sounds/oil_spill.wav");

export default class OilSpillObstacle extends EffectObject {
  private readonly ADHESION_MODIFIER = 0.002;

  constructor(position: Vec2D) {
    super(position, Obstacles.OIL_SPILL);
  }

  override onEnter(car: PhysicsBasedController) {
    if (Vector.length(car.actualForce) > 80) {
      if (car instanceof PlayerController) audio.play();
      
      car.currentAdhesionModifier *= this.ADHESION_MODIFIER;

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
}
