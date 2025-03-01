import { TrackPath } from "@/src/services/track-driver/trackpath";
import BaseDrivingPolicy from "./base-driving-policy";
import { Vec2D, Action } from "@/types/physics";
import { PhysicsUtils } from "../../util/physics-util"

import DisplayDriver from "@/src/services/display-driver/display-driver";

class MiddleDrivingPolicy extends BaseDrivingPolicy{
    private _visitedCheckpoint: number = 0;

    constructor(trackPath: TrackPath, scaling_factor: number) {
        super(trackPath, scaling_factor);
    }

    override getAction(current_position: Vec2D, current_rotation: number): Action {
        const car_position: Vec2D = {
            x: current_position.x / this._scaling_factor,
            y: current_position.y / this._scaling_factor
        };

        //* Get the target checkpoint and distance to it
        let target = this._trackPath.sampledPoints[this._visitedCheckpoint].point;
        let distance = Math.hypot(target.x - car_position.x, target.y - car_position.y);

        //* If car is close enough to the checkpoint, move to the next one
        while (distance < 5) {
            this._visitedCheckpoint = (this._visitedCheckpoint + 1) % this._trackPath.sampledPoints.length;

            target = this._trackPath.sampledPoints[this._visitedCheckpoint].point;
            distance = Math.hypot(target.x - car_position.x, target.y - car_position.y);
        }
    
        //* Compute the angle to target checkpoint
        const target_angle = PhysicsUtils.normalizeAngle(Math.atan2(target.y - car_position.y, target.x - car_position.x) * (180 / Math.PI));
    
        //* Compute the shortest angular difference
        let angle_diff = target_angle - current_rotation;
    
        const max_rotation = 6;
        var rotation = 0;

        //* Rotate in the correct direction
        if(angle_diff < 0) rotation = Math.max(angle_diff, -max_rotation);
        else rotation = Math.min(angle_diff, max_rotation);
    
        //* If the angle is close enough to the target, we can accelerate the car
        const acceleration = Math.abs(angle_diff) < 5; 
    
        return { acceleration, rotation, brake: false };
    }
    
}

export default MiddleDrivingPolicy;