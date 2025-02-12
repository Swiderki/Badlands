import BonusBase from "@/src/services/bonus/bonus-base";

class Track {
  // List of bonuses that will spawn on the track (inheriting from a base Bonus class)
  private _bonuses: BonusBase[];

  // Traction coefficient of the track (affects car handling)
  private readonly _traction: number;

  // Start positions (list of 5 starting positions for each car)
  private _startPositions: { x: number; y: number }[];

  // Layers for rendering (e.g., bridges above cars, track below cars) - list of paths to png files
  private _layers: string[];

  // Collider image (black/white PNG defining where cars can/can't go)
  private _colliderImage: Uint8ClampedArray[][];

  constructor(
    bonuses: BonusBase[],
    traction: number,
    startPositions: { x: number; y: number }[],
    layers: string[],
    colliderImage: Uint8ClampedArray[][] // Nowa struktura
  ) {
    this._bonuses = bonuses;
    this._traction = traction;
    this._startPositions = startPositions;
    this._layers = layers;
    this._colliderImage = colliderImage;
  }

  // Getters for accessing private fields safely
  get bonuses(): BonusBase[] {
    return this._bonuses;
  }

  get traction(): number {
    return this._traction;
  }

  get startPositions(): { x: number; y: number }[] {
    return this._startPositions;
  }

  get layers(): string[] {
    return this._layers;
  }

  get colliderImage(): Uint8ClampedArray[][] {
    return this._colliderImage;
  }
}

export default Track;
