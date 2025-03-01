import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { PhysicsUtils } from "@/src/util/physics-util";
import { Vector } from "@/src/util/vec-util";
import { Vec2D } from "@/types/physics";
import DisplayDriver from "../display-driver/display-driver";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't perform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  private isColliding: boolean = false; // Flaga kolizji, aby zapobiec wielokrotnemu przetwarzaniu kolizji

  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    if (this.isColliding) {
      return; // Jeśli kolizja miała miejsce, nie przetwarzaj dalszej fizyki
    }

    //* This is a simple physics loop
    this.calculateActualForce(controller);
    controller.actualForce = Vector.scale(controller.actualForce, this.calculateFriction(controller));

    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;
  }

  handleCollision(controller: PhysicsBasedController, collisionPoint: Vec2D | boolean) {
    if (!collisionPoint) {
      return;
    }
    const displayDriver = DisplayDriver.currentInstance;
    // console.log(controller.centerPosition);
    // console.log(collisionPoint);
    displayDriver?.drawForceVector(controller.centerPosition, controller.actualForce, "green");

    const approachVector = Vector.subtract(controller.centerPosition, collisionPoint as Vec2D);
    const normalizedNormal = Vector.normalize(approachVector);

    controller.actualForce = Vector.scale(controller.actualForce, 0);

    controller.position = Vector.add(controller.position, Vector.scale(normalizedNormal, 2));

    const reflectionForce = Vector.scale(normalizedNormal, -1);

    controller.actualForce = Vector.add(controller.actualForce, reflectionForce);

    controller.setCurrentSprite();
    setTimeout(() => {
      this.isColliding = false;
    }, 50);
  }

  calculateActualForce(controller: PhysicsBasedController) {
    controller.actualForce = Vector.add(controller.actualForce, controller.acceleration);
    controller.actualForce = PhysicsUtils.normalizeForceToAngle(
      controller.actualForce,
      controller.angle,
      0.3
    );
    controller.acceleration = { x: 0, y: 0 };
  }

  calculateFriction(controller: PhysicsBasedController) {
    const differenceInAngle =
      Math.floor(((Math.abs(Vector.angle(controller.actualForce) - controller.angle) % 180) / 180) * 100) /
      100;
    const noFrictionValue = 0;
    const frictionAmount =
      Math.round(
        Math.max(0, Math.sin(differenceInAngle * (3.14 + 2 * noFrictionValue) - noFrictionValue)) * 100
      ) / 100;

    const frictionFactor =
      Math.round(
        (0.995 - controller.mapAdhesion * controller.currentAdhesionModifier * frictionAmount * 0.1) * 1000
      ) / 1000;

    return frictionFactor;
  }
}

export default PhysicsDriver;
