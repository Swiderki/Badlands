import { Vec2D } from "@/types/physics";

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

  public isCollidingWithTrack(corners: Vec2D[], trackCollider: number[][]): boolean {
    return corners.some(({ x, y }) => {
      const gridPos = this.getGridPosition({ x, y });

      if (
        gridPos.x < 0 ||
        gridPos.y < 0 ||
        gridPos.y >= trackCollider.length ||
        gridPos.x >= trackCollider[0].length
      ) {
        return true; //* Out of bounds
      }

      return trackCollider[gridPos.y][gridPos.x] === 1; //* 1 = Wall
    });
  }
}

export default CollisionManager;
