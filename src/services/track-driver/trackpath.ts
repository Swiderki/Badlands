import { getEvenlySpacedPoints, parseSVGPath } from "@/src/util/bezier-util";
import { CheckPoint } from "@/types/track-driver";
import DisplayDriver from "../display-driver/display-driver";
import { Vec2D } from "@/types/physics";

export class TrackPath {
  private path: string;
  sampledPoints: CheckPoint[] = [];

  constructor(path: string, numPoints: number) {
    this.path = path;
    this._processCheckpoints(numPoints);
  }

  private _processCheckpoints(numPoints: number) {
    this.sampledPoints = getEvenlySpacedPoints(parseSVGPath(this.path), numPoints);
  }

  centerTrackPath(canvasWidth: number, canvasHeight: number, pathOffset: Vec2D) {
    // Get the width and height of the track path
    const { width, height } = this._getWidthAndHeight();

    // Calculate the offset for the x and y coordinates
    const offsetX = (canvasWidth - width) / 2 + pathOffset.x;
    const offsetY = (canvasHeight - height) / 2 + pathOffset.y;

    // console.log(width, height);
    // console.log(offsetX, offsetY);

    // Loop through all sampled points and update the x and y coordinates
    for (const checkpoint of this.sampledPoints) {
      checkpoint.point.x += offsetX;
      checkpoint.point.y += offsetY;
    }
  }

  private _getWidthAndHeight() {
    // Initialize variables to store the min and max coordinates
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    // Loop through all sampled points and update min/max values
    for (const checkpoint of this.sampledPoints) {
      const { x, y } = checkpoint.point;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Calculate the width and height of the track path
    const width = maxX - minX;
    const height = maxY - minY;

    return { width, height };
  }

  static createFromPath(path: string, numPoints: number, displayDriver: DisplayDriver, pathOffset: Vec2D) {
    const trackPath = new TrackPath(path, numPoints);
    trackPath.centerTrackPath(
      displayDriver.normalizedDisplayWidth,
      displayDriver.normalizedDisplayHeight,
      pathOffset
    );
    trackPath.reverse();
    trackPath.reduce(10);
    return trackPath;
  }

  reduce(numPoints: number) {
    this.sampledPoints = this.sampledPoints.filter((_, i) => i % numPoints === 0);
  }

  reverse() {
    this.sampledPoints.reverse();
  }
}
