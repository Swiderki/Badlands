import BonusBase from "@/src/services/bonus/bonus-base";
import DisplayDriver from "../display-driver/display-driver";
import { Sprite } from "@/types/display-driver";
import { StartPosition } from "@/types/track-driver";
import { TrackPath } from "./track-path";

class Track {
  //* List of bonuses that will spawn on the track (inheriting from a base Bonus class)
  private _bonuses: BonusBase[];

  private _traction: number;

  //* Start positions (list of 5 starting positions for each car)
  private _startPositions: StartPosition[];

  //* Layers for rendering (e.g., bridges above cars, track below cars) - list of paths to png files
  private _layers: Array<Sprite | null>;

  //* Collider 2d array (value under each record is defining where cars can/can't go)
  private _colliderImage: number[][];

  private _checkPointPath: TrackPath | null = null;

  private static _instance: Track;

  constructor(
    bonuses: BonusBase[],
    traction: number,
    startPositions: StartPosition[],
    layers: Array<Sprite | null>,
    colliderImage: number[][],
    checkPointPath: TrackPath
  ) {
    this._bonuses = bonuses;
    this._traction = traction;
    this._startPositions = startPositions;
    this._layers = layers;
    this._colliderImage = colliderImage;
    this._checkPointPath = checkPointPath;
    Track._instance = this;
  }

  //* Getters for accessing private fields safely

  get bonuses(): BonusBase[] {
    return this._bonuses;
  }

  get startPositions(): StartPosition[] {
    return this._startPositions;
  }

  get layers(): Array<Sprite | null> {
    return this._layers;
  }

  get colliderImage(): number[][] {
    return this._colliderImage;
  }

  get checkPointPath(): TrackPath | null {
    return this._checkPointPath;
  }

  static get currentInstance(): Track | null {
    if (!Track._instance) {
      return null;
    }
    return Track._instance;
  }

  displayCheckpoints(displayDriver: DisplayDriver) {
    if (!this._checkPointPath) return;

    displayDriver.displayCheckpoints(this._checkPointPath.sampledPoints);
  }
}

export default Track;
