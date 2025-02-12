// Dict that maps traction values to different types of surface

export const TRACTION_MAP: Record<number, number> = {
    [0]: -1,   // 0 represents wall (area unavailable for car)
    [1]: 1,    // 1 represents asphalt - best surface to drive on
    [2]: 0.7,  // 2 represents dirt
    [3]: 0.3,  // 3 represents ice
};

