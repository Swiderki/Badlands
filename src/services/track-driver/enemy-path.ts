import { Vector } from "@/src/util/vec-util";
import { TrackPath } from "./track-path";
import { Vec2D } from "@/types/physics";
import { CheckPoint } from "@/types/track-driver";
import DisplayDriver from "../display-driver/display-driver";
import CollisionManager from "../collision/collision-manager";
import OpponentController from "@/src/controllers/opponents-controller";
import { PathIntersection } from "@/types/collision";

export class EnemyPath extends TrackPath {
  actualPath: CheckPoint[] = [];
  private _actualPathLength: number = 0;
  private _actualPathCurrentPointOffset: number = 0;
  private _pathOffset: number = 6;
  private readonly _maxActualPathLength: number = 500;

  private _actualPathCurrentPoint: number = 0;

  visitedCheckpoints: number = 1;

  constructor(path: string, numPoints: number) {
    super(path, numPoints);
  }

  get actualPathCurrentPoint(): number {
    return this._actualPathCurrentPoint;// + this._pathOffset;
  }

  get currentTargetCheckPoint(): CheckPoint {
    return this.actualPath[this._pathOffset-1];
  }

  get nextTargetCheckPoint(): CheckPoint {
    return this.actualPath[this._pathOffset];
  }

  getDistanceToActualPoint(pos: Vec2D): number {
    const someArbitraryValue = 100;
    const point = this.currentTargetCheckPoint.point;
    const previousPoint = this.nextTargetCheckPoint.point;
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

    return distance;
  }

  set actualPathCurrentPoint(value: number) {
    ///* Delete previous point in _ActualPath
    const removedDistance = this.actualPath.slice(0, value + 1).reduce((acc, point, index) => {
      if (index === 0) return 0;
      return acc + Vector.length(Vector.subtract(point.point, this.actualPath[index - 1].point));
    }, 0);

    this._actualPathLength -= removedDistance;
    this.actualPath = this.actualPath.slice(value);

    while (!(this._actualPathLength > this._maxActualPathLength && this.actualPath.length > 4)) {
      const checkPoint = this.sampledPoints[this._actualPathCurrentPointOffset % this.sampledPoints.length];
      const nextCheckPoint =
        this.sampledPoints[(this._actualPathCurrentPointOffset + 1) % this.sampledPoints.length];
      const distance = Vector.length(Vector.subtract(checkPoint.point, nextCheckPoint.point));
      this.actualPath.push(checkPoint);
      this._actualPathLength += distance;
      this._actualPathCurrentPointOffset++;
    }
  }

  generateActualPath() {
    this.actualPath = [];
    this._actualPathLength = 0;

    // if(this._actualPathCurrentPointOffset > 2) this._actualPathCurrentPointOffset -= 3;

    while (this._actualPathLength < this._maxActualPathLength) {
      const point = this.sampledPoints[this._actualPathCurrentPointOffset].point;
      const nextPoint =
        this.sampledPoints[this._actualPathCurrentPointOffset + 1]?.point || this.sampledPoints[0].point;
      const distance = Vector.length(Vector.subtract(point, nextPoint));
      this.actualPath.push(this.sampledPoints[this._actualPathCurrentPointOffset]);
      this._actualPathLength += distance;
      this._actualPathCurrentPointOffset++;
    }
  }

  static createFromTrackPath(trackPath: TrackPath, offset?: number): EnemyPath {
    const enemyPath = new EnemyPath(trackPath.path, trackPath.sampledPoints.length);
    enemyPath.sampledPoints = trackPath.sampledPoints;
    enemyPath.sampledPoints = enemyPath.sampledPoints.map((checkpoint) => {
      const { tangent } = checkpoint;
      const angle = Math.atan2(tangent.y, tangent.x);
      const newAngle = angle + Math.PI / 2;
      const offsetVector = Vector.scale({ x: Math.cos(newAngle), y: Math.sin(newAngle) }, offset || 10);
      return { ...checkpoint, point: Vector.add(checkpoint.point, offsetVector) };
    });

    enemyPath.generateActualPath();
    return enemyPath;
  }

  updateActualTrackPathIfIntersects(parentController: OpponentController) {
    const collisionManager = CollisionManager.instance;
    if (!collisionManager) return;

    // Get intersections of the actual path with obstacles.
    const intersections = collisionManager.getActualPathIntersections(this.actualPath, this.sampledPoints, parentController);

    if (intersections.length === 0) return;

    for (const intersection of intersections) {
      const { intersectionStartIndex } = intersection;

      const intersectionEndIndex =
        intersection.intersectionEndIndex + 3
          ? intersection.intersectionEndIndex
          : intersection.intersectionEndIndex + 3; 
      const intersectionEndPoint = this.actualPath[intersectionEndIndex].point; 

      let positionOfObstacle = Vector.add(
        Vector.scale(Vector.add(intersection.objectCorners[0], intersection.objectCorners[2]), 0.5),
        { x: 12, y: 12 } //! It will work only for obstacles that are 24x24
      );

      const pointsToReconsider = this.actualPath
        .slice(intersectionStartIndex, intersectionEndIndex + 1)
        .map((point) => point.point);

      let safeDistance = 55;
      const newPoints: Vec2D[] = [];

      for (let i = 0; i < pointsToReconsider.length-1; i++) {
        const p1 = pointsToReconsider[i];

        const v = Vector.subtract(p1, positionOfObstacle);
        const distance = Vector.distance(p1, positionOfObstacle);

        const offset = Vector.scale(
          Vector.normalize(v),
          Math.max((safeDistance - distance), 0)
        );

        let finalPoint = p1;
        let offsetDiff = Vector.normalize(offset);
        let tempOffset = offsetDiff;

        while(!this.isPointOnTrack(finalPoint, 1) && Vector.length(offset) > Vector.length(tempOffset)){
          tempOffset = Vector.add(tempOffset, Vector.scale(offsetDiff, 10));
          if(this.isPointOnTrack(Vector.add(p1, tempOffset), 1)) break;
          finalPoint = Vector.add(p1, tempOffset);
        }

        newPoints.push(finalPoint);
      }

      const newCheckpoints = newPoints.map((p, index) => {
        const nextPoint = newPoints[index + 1] || intersectionEndPoint; // Get the next point (or use `end` for the last one)
        const tangent = Vector.normalize(Vector.subtract(nextPoint, p));

        // Calculate curvature (example based on angle between tangents)
        const previousTangent = newPoints[index - 1]
          ? Vector.normalize(Vector.subtract(p, newPoints[index - 1]))
          : tangent;

        const curvature = Vector.angleBetween(tangent, previousTangent); // Use a method to calculate angle between vectors

        return { point: p, tangent, curvature };
      });

      this.actualPath.splice(
        intersectionStartIndex,
        intersectionEndIndex - intersectionStartIndex,
        ...newCheckpoints
      );

      this._actualPathLength = this.actualPath.reduce((acc, point, index) => {
        if (index === 0) return 0;
        return acc + Vector.length(Vector.subtract(point.point, this.actualPath[index - 1].point));
      }, 0);
    }
  }
  
  private isPointOnTrack(point: Vec2D, radius: number): boolean {
    const collisionManager = CollisionManager.instance;
    if (!collisionManager) return false;
    return collisionManager.circleOverlapsWithTrack(point, radius);
  }
}
