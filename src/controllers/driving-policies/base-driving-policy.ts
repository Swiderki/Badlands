import { EnemyPath } from "@/src/services/track-driver/enemy-path";
import { TrackPath } from "@/src/services/track-driver/track-path";
import { Vec2D, Action } from "@/types/physics";

//* Base class for driving policies - classes that are responsible for decision making in opponents

abstract class BaseDrivingPolicy {
  // eslint-disable-next-line no-undef
  protected _enemyPath: EnemyPath;
  protected _scaling_factor: number;

  constructor(trackPath: EnemyPath, scaling_factor: number) {
    this._enemyPath = trackPath;
    this._scaling_factor = scaling_factor;
  }

  abstract getAction(
    current_position: Vec2D,
    current_rotation: number,
    actualForce: Vec2D,
    maxSpeed: number
  ): Action;
}

export default BaseDrivingPolicy;
