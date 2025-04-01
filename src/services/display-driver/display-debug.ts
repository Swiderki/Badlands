import GameScene from "@/src/scenes/game-scene";
import { Vector } from "@/src/util/vec-util";
import CollisionManager from "../collision/collision-manager";

export function displayGameDebugInfo(gameScene: GameScene) {
  const { displayDriver, track, opponentControllersList, effectObjects } = gameScene;

  //* Draw FinishLine
  if (track && track.checkPointPath) {
    const samplePoints = track.checkPointPath.sampledPoints;
    const finishLinePoint = samplePoints[samplePoints.length - 1].point;
    const previousPoint = samplePoints[samplePoints.length - 2].point;
    const finishLineVector = Vector.scale(
      Vector.normalize(Vector.perpendicular(Vector.subtract(finishLinePoint, previousPoint))),
      80
    );
    displayDriver.drawForceVector(finishLinePoint, finishLineVector, "blue");
    displayDriver.drawForceVector(finishLinePoint, Vector.scale(finishLineVector, -1), "blue");
  }

  //* Display CheckPoint paths
  if (track && track.checkPointPath) {
    const sampledPoints = track.checkPointPath.sampledPoints;
    displayDriver.displayCheckpoints(sampledPoints);
  }

  //* Display enemy path
  if (track) {
    for (const enemy of opponentControllersList) {
      const enemyPath = enemy.drivingPolicy.enemyPath.sampledPoints;
      displayDriver.displayCheckpoints(enemyPath, "red");
      const actualPath = enemy.drivingPolicy.enemyPath.actualPath;
      displayDriver.displayActualPath(actualPath, "green");
    }
  }

  //* Display invisible obstacles
  const collisionManager = CollisionManager.instance;
  if (collisionManager) {
    for (const obstacle of effectObjects) {
      if (!obstacle) continue;
      if (!obstacle.visible) {
        const corners = collisionManager.getRotatedCorners(obstacle.collision);
        displayDriver.displayColliderCorners(corners, obstacle.position, 0);
      }
    }
  }
}
