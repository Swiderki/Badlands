import { TrackPath } from "@/src/services/track-driver/trackpath";
import { Vec2D, Action } from "@/types/physics";

//* Base class for driving policies - classes that are responsible for decision making in opponents

abstract class BaseDrivingPolicy{
    protected _trackPath: TrackPath
    protected _scaling_factor: number

    constructor(trackPath: TrackPath, scaling_factor: number){
        this._trackPath = trackPath
        this._scaling_factor = scaling_factor
    }

    abstract getAction(current_position: Vec2D, current_rotation: number) : Action;
}

export default BaseDrivingPolicy;