import { CollisionObject } from "@/types/collision";
import DisplayDriver from "../display-driver/display-driver";
import { EffectSprites } from "@/src/util/effects-utils";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Sprite } from "@/types/display-driver";
import { Vec2D } from "@/types/physics";

/** This is a class representing physical object on the truck like pothole, puddle etc. */
export default class EffectObject {
  // protected isColliding: boolean = false;
  protected previouslyCollidingCars: PhysicsBasedController[] = [];
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
  _update(currentlyCollidingCars: PhysicsBasedController[]): void {
    const enteringCars = currentlyCollidingCars.filter(
      (car) => !this.previouslyCollidingCars.find((prevCar) => Object.is(car, prevCar))
    );
    const exitingCars = this.previouslyCollidingCars.filter(
      (prevCar) => !currentlyCollidingCars.find((car) => Object.is(prevCar, car))
    );
    const collidingCars = currentlyCollidingCars.filter(
      (car) => !enteringCars.find((entCar) => Object.is(entCar, car))
    );

    enteringCars.forEach((car) => {
      this._onEnter(car);
      this.onEnter(car);
    });
    collidingCars.forEach(this.onColliding);
    exitingCars.forEach(this.onExit);

    this.previouslyCollidingCars = currentlyCollidingCars;

    // collidingCars.forEach((car) => {
    //   const isFirstContact = !this.previouslyCollidingCars.some((prevCar) => Object.is(prevCar, car))
    //   if () {
    //     if (car.isCollidingWithEffectObject) {
    //       return this.onColliding(car);
    //     }
    //     if (isFirstContact) {
    //       car.isCollidingWithEffectObject = true;
    //       return this.onEnter(car);
    //     }
    //   }
    //   // if (isNowColliding) {
    //   //   if (this.isColliding) {
    //   //     return this.onColliding();
    //   //   }
    //   //   this.isColliding = true;
    //   //   return this.onEnter();
    //   // }
    //   // if (this.isColliding) {
    //   //   this.isColliding = false;
    //   //   return this.onExit();
    //   // }
    // });
  }

  /** This method should be overriden in GameScene allowing it to remove perk after it has been used since perks are dynamic, single-use objects */
  _onEnter(car: PhysicsBasedController): void {}

  onEnter(car: PhysicsBasedController): void {}

  onExit(car: PhysicsBasedController): void {}

  onColliding(car: PhysicsBasedController): void {}
}
