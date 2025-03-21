import { CollisionObject } from "@/types/collision";
import { Vec2D } from "@/types/physics";
import { Vector } from "@/src/util/vec-util";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { getCarCorners, rayCast } from "@/src/util/collision-util";
import GameScene from "@/src/scenes/GameScene";
import Game from "../game";
import DisplayDriver from "../display-driver/display-driver";
import { debug } from "console";

class CollisionManager {
  scalingFactor: number;
  static _instance: CollisionManager | null = null;

  static get instance(): CollisionManager | null {
    return CollisionManager._instance;
  }

  rayCastFromController(
    controller: PhysicsBasedController,
    length: number,
    angleOffset: number,
    debug: boolean = false
  ): Vec2D | null {
    const { x, y } = controller.centerPosition;
    const angle = controller.angle + angleOffset;
    const angleInRadians = angle * (Math.PI / 180);

    const endVector = { x: x + length * Math.cos(angleInRadians), y: y + length * Math.sin(angleInRadians) };

    let bestIntersection: Vec2D | null = null;

    console.log("INCOMING RAYCAST");
    if (debug) DisplayDriver.currentInstance?.drawLineBetweenVectors({ x, y }, endVector, "orange");

    const gameSceneRef = Game.getInstance().currentScene as GameScene;
    if (!(gameSceneRef instanceof GameScene)) {
      return null;
    }

    const updateIntersection = (intersection: Vec2D | null) => {
      if (!intersection) {
        return;
      }

      if (!bestIntersection) {
        bestIntersection = intersection;
        return;
      }

      const dist1 = Vector.distance(controller.centerPosition, intersection);
      const dist2 = Vector.distance(controller.centerPosition, bestIntersection);

      if (dist1 < dist2) {
        bestIntersection = intersection;
      }
    };

    //* Intersect with opponents
    const opponentList = gameSceneRef.opponentControllersList;
    for (const opponent of opponentList) {
      if (opponent === controller) {
        continue;
      }
      const castRes = rayCast(
        controller.centerPosition,
        endVector,
        getCarCorners(opponent.position, opponent.colliderWidth, opponent.colliderHeight, opponent.angle)
      );

      updateIntersection(castRes);
    } 

    //* Intersect with obstacles
    const obstacleList = gameSceneRef.effectObjects;
    for (const obstacle of obstacleList) {
      if (obstacle === undefined || obstacle === null) continue;
      const castRes = rayCast(
        controller.centerPosition ,
        endVector,
        this.getRotatedCorners(obstacle.collision)
      );

      updateIntersection(castRes);
    }
    console.log(bestIntersection);
    return bestIntersection;
  }

  constructor(scalingFactor: number) {
    this.scalingFactor = scalingFactor;
    CollisionManager._instance = this;
  }

  private getGridPosition(position: Vec2D): { x: number; y: number } {
    return {
      x: Math.floor(position.x / this.scalingFactor),
      y: Math.floor(position.y / this.scalingFactor),
    };
  }

  private _isCollidingWithTrack(corners: Vec2D[], trackCollider: number[][]): Vec2D | null {
    for (const { x, y } of corners) {
      const gridPos = this.getGridPosition({ x, y });

      if (
        gridPos.x < 0 ||
        gridPos.y < 0 ||
        gridPos.y >= trackCollider.length ||
        gridPos.x >= trackCollider[0].length
      ) {
        return { x: gridPos.x, y: gridPos.y };
      }

      if (trackCollider[gridPos.y][gridPos.x] !== 0) {
        return { x: gridPos.x, y: gridPos.y };
      }
    }

    return null;
  }

  public isCollidingWithTrack(corners: Vec2D[], trackCollider: number[][]): Vec2D | null {
    const v = this._isCollidingWithTrack(corners, trackCollider);
    if (!v) {
      return null;
    }

    return Vector.scale(v, this.scalingFactor);
  }

  public isCollidingWithAnotherObject(object1: CollisionObject | Vec2D[], object2: CollisionObject): boolean {
    const corners1 = Array.isArray(object1) ? object1 : this.getRotatedCorners(object1);
    const corners2 = this.getRotatedCorners(object2);

    const axes = [...this.getAxes(corners1), ...this.getAxes(corners2)];

    for (const axis of axes) {
      const proj1 = this.projectPolygon(corners1, axis);
      const proj2 = this.projectPolygon(corners2, axis);

      if (!this.overlaps(proj1, proj2)) {
        return false;
      }
    }

    return true;
  }

  private getRotatedCorners(obj: CollisionObject): Vec2D[] {
    const { x, y, width, height, angle } = obj;

    const halfW = width / 2;
    const halfH = height / 2;

    const localCorners: Vec2D[] = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH },
    ];

    return localCorners.map((corner) => {
      const rotatedX = corner.x * Math.cos(angle) - corner.y * Math.sin(angle);
      const rotatedY = corner.x * Math.sin(angle) + corner.y * Math.cos(angle);
      return { x: x + rotatedX, y: y + rotatedY };
    });
  }

  private getAxes(corners: Vec2D[]): Vec2D[] {
    const axes: Vec2D[] = [];
    for (let i = 0; i < corners.length; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % corners.length];

      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };

      const normal = { x: -edge.y, y: edge.x };

      const length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
      axes.push({ x: normal.x / length, y: normal.y / length });
    }
    return axes;
  }

  private projectPolygon(corners: Vec2D[], axis: Vec2D): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    for (const corner of corners) {
      const projection = corner.x * axis.x + corner.y * axis.y;
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }

    return { min, max };
  }

  private overlaps(proj1: { min: number; max: number }, proj2: { min: number; max: number }): boolean {
    return proj1.max >= proj2.min && proj2.max >= proj1.min;
  }
}

export default CollisionManager;
