import { Sprite, SpriteArray } from "@/types/display-driver";
import DisplayDriver from "../display-driver/display-driver";
import Track from "./track-driver";
import { StartPosition } from "@/types/track-driver";
import { Vec2D } from "@/types/physics";

class TrackLoader {
  static async loadTrack(displayDriver: DisplayDriver, src: string): Promise<Track> {
    return fetch(location.origin + src)
      .then((response) => response.json())
      .then((data) => {
        //* fetch all needed sprites
        
        const layers = data.layers.map((layerName: string) =>
          displayDriver.getSprite(layerName)
        ) as Array<Sprite | null>;
        const startPositions: StartPosition[] = data.startPositions.map(({ x, y, angle }: { x: number; y: number, angle: number }) => ({position: { x, y } as Vec2D, angle}));
        
        return new Track(data.bonuses, data.traction, startPositions, layers, data.colliderImage);
      })
      .catch((error) => {
        throw new Error(`Failed to load track: ${error}`);
      });
  }

  static extractColliderFromImage(displayDriver: DisplayDriver, spriteName: string): SpriteArray {
    return [];
  }
}

export default TrackLoader;
