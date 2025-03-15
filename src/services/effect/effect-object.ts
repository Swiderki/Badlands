import { CollisionObject } from "@/types/collision";
import DisplayDriver from "../display-driver/display-driver";
import { EffectSprites } from "@/src/util/effects-utils";
import { Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";

/** This is a class representing physical object on the truck like pothole, puddle etc. */
export default class EffectObject {
  private isColliding: boolean = false;
  readonly collision: CollisionObject;
  readonly position: Vec2D;
  readonly sprite: Sprite;

  constructor(position: Vec2D, sprite: EffectSprites) {
    const spriteObject = DisplayDriver.currentInstance?.getSprite(sprite);
    if (!spriteObject) {
      throw new Error("Sprite not found");
    }

    this.position = position;
    this.sprite = spriteObject;
    this.collision = {
      x: position.x,
      y: position.y,
      width: spriteObject.config.spriteWidth,
      height: spriteObject.config.spriteHeight,
      angle: 0,
    };
  }

  /** Should be called only when player is colliding with Obstacle  */
  _update(isNowColliding: boolean): void {
    if (isNowColliding) {
      if (this.isColliding) {
        return this.onColliding();
      }
      this.isColliding = true;
      return this.onEnter();
    }
    if (this.isColliding) {
      this.isColliding = false;
      return this.onExit();
    }
  }

  onEnter(): void {}

  onExit(): void {}

  onColliding(): void {}
}
