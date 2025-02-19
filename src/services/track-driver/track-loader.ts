import { Sprite, SpriteArray } from "@/types/display-driver";
import DisplayDriver from "../display-driver/display-driver";
import Track from "./track-driver";

class TrackLoader {
  static async loadTrack(displayDriver: DisplayDriver, src: string): Promise<Track> {
    return fetch(location.origin + src)
      .then((response) => response.json())
      .then((data) => {
        //* fetch all needed sprites
        const layers = data.layers.map((layerName: string) =>
          displayDriver.getSprite(layerName)
        ) as Array<Sprite | null>;
        return new Track(data.bonuses, data.traction, data.startPositions, layers, data.colliderImage);
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
