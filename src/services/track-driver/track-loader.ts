import { Color, Sprite } from "@/types/display-driver";

import { mapPixelToCollisionType } from "@/src/util/misc-utils";
import { Vec2D } from "@/types/physics";
import { StartPosition } from "@/types/track-driver";
import DisplayDriver from "../display-driver/display-driver";
import Track from "./track-driver";
import { TrackPath } from "./track-path";

//* import types for track intellisense
import type grassTrack from "@/public/assets/tracks/grass/track.json";
import type gravelTrack from "@/public/assets/tracks/gravel/track.json";
import type snowTrack from "@/public/assets/tracks/snow/track.json";

type Normalize<T> = {
  [K in keyof T]: T[K] extends number ? number : T[K];
} & Partial<{
  openedShortcutColliderImage: string;
  gates: Array<{ x: number; y: number; sprite: string }>;
  isRainy: boolean;
}>;

type NormalizedGrassTrack = Normalize<typeof grassTrack>;
type NormalizedGravelTrack = Normalize<typeof gravelTrack>;
type NormalizedSnowTrack = Normalize<typeof snowTrack>;

type TrackDefinition = NormalizedGrassTrack | NormalizedGravelTrack | NormalizedSnowTrack;

class TrackLoader {
  static async loadTrack(displayDriver: DisplayDriver, src: string): Promise<Track> {
    return fetch(location.origin + src)
      .then((response) => response.json())
      .then(async (data: TrackDefinition) => {
        //* fetch all needed sprites
        const fgLayers = data.fgLayers.map((layerName: string) =>
          displayDriver.getSprite(layerName)
        ) as Array<Sprite | null>;

        const bgLayers = data.bgLayers.map((layerName: string) =>
          displayDriver.getSprite(layerName)
        ) as Array<Sprite | null>;

        const startPositions: StartPosition[] = data.startPositions.map(
          ({ x, y, angle }: { x: number; y: number; angle: number }) => ({
            position: { x, y } as Vec2D,
            angle,
          })
        );

        //* Extract collider data from image
        const baseColliderImageData = await TrackLoader.extractColliderFromImage(
          displayDriver,
          data.colliderImage
        );
        const openedShortcutColliderImage = data.openedShortcutColliderImage
          ? await TrackLoader.extractColliderFromImage(displayDriver, data.openedShortcutColliderImage)
          : null;

        const gates = data.gates ?? [];
        const isRainy = data.isRainy ?? false;
        const pathOffset = data.pathOffset;
        const scale = data.scale ?? displayDriver.scaler;
        const checkPointPath = TrackPath.createFromPath(
          data.checkPointPath,
          100,
          displayDriver,
          pathOffset,
          scale,
          data.pointOffset
        );

        return new Track(
          data.bonuses,
          data.traction,
          startPositions,
          fgLayers,
          bgLayers,
          baseColliderImageData,
          openedShortcutColliderImage,
          gates,
          checkPointPath,
          isRainy
        );
      });
  }

  static extractColliderFromImage(displayDriver: DisplayDriver, spriteName: string): Promise<number[][]> {
    return new Promise((resolve, reject) => {
      const sprite = displayDriver.getSprite(spriteName);
      if (!sprite?.image) {
        reject(new Error(`Sprite '${spriteName}' not found or has no image.`));
        return;
      }

      const image = sprite.image;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get 2D context"));
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;
      const width = image.width;
      const height = image.height;

      const colliderData: number[][] = [];
      const debug: Color[] = [];

      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];
          debug.push({ r, g, b, a });

          row.push(mapPixelToCollisionType(r, g, b, a));
        }
        colliderData.push(row);
      }

      resolve(colliderData);
    });
  }
}

export default TrackLoader;
