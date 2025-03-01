//* Base class for bonuses spawned on the track
class BonusBase {
    public x: number;
    public y: number;
    public spawningSecInterval: number;

    constructor(x: number, y: number, spawningSecInterval: number) {
        this.x = x;
        this.y = y;
        this.spawningSecInterval = spawningSecInterval;
    }
}

export default BonusBase