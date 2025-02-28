import { Vector } from "@/src/util/vec-util";
import { Vec2D } from "@/types/physics";
import { Vector } from "@/src/util/vec-util";

class CollisionManager {
  scalingFactor: number;

  constructor(scalingFactor: number) {
    this.scalingFactor = scalingFactor;
  }

  private getGridPosition(position: Vec2D): { x: number; y: number } {
    return {
      x: Math.floor(position.x / this.scalingFactor),
      y: Math.floor(position.y / this.scalingFactor),
    };
  }

  private _isCollidingWithTrack(corners: Vec2D[], trackCollider: number[][]): Vec2D | null {
    // Iterujemy przez rogi i sprawdzamy, czy któryś z nich koliduje z torami
    for (const { x, y } of corners) {
      const gridPos = this.getGridPosition({ x, y });

      // Sprawdzamy, czy pozycja jest poza granicami
      if (
        gridPos.x < 0 ||
        gridPos.y < 0 ||
        gridPos.y >= trackCollider.length ||
        gridPos.x >= trackCollider[0].length
      ) {
        return { x: gridPos.x, y: gridPos.y }; // Zwracamy obiekt z pozycją, jeśli jest poza granicami
      }

      // Sprawdzamy, czy na danym polu znajduje się ściana (np. 1)
      if (trackCollider[gridPos.y][gridPos.x] !== 0) {
        return { x: gridPos.x, y: gridPos.y }; // Zwracamy obiekt z pozycją, jeśli koliduje z murem
      }
    }

    // Jeśli żadna kolizja nie miała miejsca, zwracamy null
    return null;
  }

  public isCollidingWithTrack(corners: Vec2D[], trackCollider: number[][]): Vec2D | null {
    const v = this._isCollidingWithTrack(corners, trackCollider);
    if (!v) {
      return null;
    }

    return Vector.scale(v, this.scalingFactor);
  }
}

export default CollisionManager;
