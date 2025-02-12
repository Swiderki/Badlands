import BonusBase from "@/src/services/bonus/bonus-base";
import { Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";

class Track {
  //* List of bonuses that will spawn on the track (inheriting from a base Bonus class)
  private _bonuses: BonusBase[];

  //* Start positions (list of 5 starting positions for each car)
  private _startPositions: Vec2D[];

  //* Layers for rendering (e.g., bridges above cars, track below cars) - list of paths to png files
  private _layers: Sprite;

  //* Collider 2d array (value under each record is defining where cars can/can't go)
  private _colliderImage: number[][];

  constructor(
    bonuses: BonusBase[],
    startPositions: Vec2D[],
    layers: Sprite,
    colliderImage: number[][]
  ) {
    this._bonuses = bonuses;
    this._startPositions = startPositions;
    this._layers = layers;
    this._colliderImage = colliderImage;
  }

  //* Getters for accessing private fields safely
  
  get bonuses(): BonusBase[] {
    return this._bonuses;
  }

  get startPositions(): Vec2D[] {
    return this._startPositions;
  }

  get layers(): Sprite {
    return this._layers;
  }

  get colliderImage(): number[][] {
    return this._colliderImage;
  }
}

export default Track;
