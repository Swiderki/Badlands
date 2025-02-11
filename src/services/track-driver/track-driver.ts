import BonusBase from "@/src/services/bonus/bonus-base";

class Track {
    // List of bonuses that will spawn on the track (inheriting from a base Bonus class)
    private bonuses: BonusBase[];
    
    // Traction coefficient of the track (affects car handling)
    private traction: number;
    
    // Start positions (list of 5 starting positions for each car)
    private startPositions: { x: number; y: number }[];
    
    // Layers for rendering (e.g., bridges above cars, track below cars) - list of paths to png files
    private layers: string[];
    
    // Collider image (black/white PNG defining where cars can/can't go)
    private colliderImage: Uint8ClampedArray[][];

    constructor(
        bonuses: BonusBase[], 
        traction: number, 
        startPositions: { x: number; y: number }[], 
        layers: string[], 
        colliderImage: Uint8ClampedArray[][] // Nowa struktura
    ) {
        this.bonuses = bonuses;
        this.traction = traction;
        this.startPositions = startPositions;
        this.layers = layers;
        this.colliderImage = colliderImage;
    }

    // Getters for accessing private fields safely
    public getBonuses(): BonusBase[] {
        return this.bonuses;
    }

    public getTraction(): number {
        return this.traction;
    }

    public getStartPositions(): { x: number; y: number }[] {
        return this.startPositions;
    }

    public getLayers(): string[] {
        return this.layers;
    }

    public getColliderImage(): Uint8ClampedArray[][] {
        return this.colliderImage;
    }
}

export default Track;