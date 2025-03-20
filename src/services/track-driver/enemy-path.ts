import { Vector } from "@/src/util/vec-util";
import { TrackPath } from "./track-path";

export class EnemyPath extends TrackPath {
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
    return enemyPath;
  }
}
