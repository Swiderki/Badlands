import { TrackPath } from "./track-path";

export class EnemyPath extends TrackPath {

    static createFromTrackPath(trackPath: TrackPath) {
        const enemyPath = new EnemyPath(trackPath.path, trackPath.sampledPoints.length);
        enemyPath.sampledPoints = trackPath.sampledPoints;
        return enemyPath;
    }
}

