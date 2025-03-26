import { getEvenlySpacedPoints, parseSVGPath } from "@/src/util/bezier-util";
import { CheckPoint } from "@/types/track-driver";
import DisplayDriver from "../display-driver/display-driver";
import { Vec2D } from "@/types/physics";
import { Vector } from "@/src/util/vec-util";

export class TrackPath {
  path: string;
  sampledPoints: CheckPoint[] = [];

  constructor(path: string, numPoints: number) {
    this.path = path;
    this._processCheckpoints(numPoints);
  }

  getDistanceToPoint(pos: Vec2D, pointId: number): number {
    const someArbitraryValue = 100;
    const point = this.sampledPoints[pointId].point;
    const previousPoint = this.sampledPoints[pointId - 1].point;
    const v1 = Vector.normalize(Vector.subtract(point, previousPoint));
    const p1 = Vector.add(Vector.scale({ x: -v1.y, y: v1.x }, someArbitraryValue), point);
    const p2 = Vector.add(Vector.scale({ x: v1.y, y: -v1.x }, someArbitraryValue), point);

    const v2 = Vector.subtract(p2, p1); // Wektor prostopadły do toru
    const w = Vector.subtract(pos, p1); // Wektor od p1 do pos

    // Rzut wektora w na v2, żeby znaleźć punkt najbliższy na odcinku
    const projectionScalar = Vector.dot(w, v2) / Vector.dot(v2, v2);
    const closestPoint = Vector.add(p1, Vector.scale(v2, projectionScalar));

    // Obliczanie odległości między pos a closestPoint
    const distance = Vector.length(Vector.subtract(pos, closestPoint));
    if (pointId === this.sampledPoints.length - 1) {
      // console.table({ point, previousPoint, p1, p2, v2, w, projectionScalar, closestPoint, distance });
    }
    const dd = DisplayDriver.currentInstance;
    if (dd) {
      dd.drawLineBetweenVectors(p1, p2, "red");
      dd.drawLineBetweenVectors(pos, closestPoint, "blue"); // Rysuje linię od pos do najbliższego punktu
    }

    return distance;
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
    trackPath.sampledPoints.forEach((p) => {
      p.point = Vector.scale(p.point, displayDriver.scaler);
    });
    return trackPath;
  }

  reduce(numPoints: number) {
    const uniquePoints = new Map<string, CheckPoint>();

    this.sampledPoints = this.sampledPoints
      .filter((checkpoint) => {
        const key = `${checkpoint.point.x},${checkpoint.point.y}`;
        if (uniquePoints.has(key)) {
          return false;
        }
        uniquePoints.set(key, checkpoint);
        return true;
      })
      .filter((_, i) => i % numPoints === 0); // Zmniejszenie liczby punktów
  }

  reverse() {
    this.sampledPoints.reverse();
  }
}
