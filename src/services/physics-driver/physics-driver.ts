import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { PhysicsUtils } from "@/src/util/physics-util";
import { Vector } from "@/src/util/vec-util";
import { Vec2D } from "@/types/physics";
import DisplayDriver from "../display-driver/display-driver";
import { sign } from "crypto";
import GameTimeline from "../game-logic/game-timeline";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't perform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  private isColliding: boolean = false; // Flaga kolizji, aby zapobiec wielokrotnemu przetwarzaniu kolizji

  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    if (this.isColliding) {
      return;
    }

    //* This is a simple physics loop
    this.calculateActualForce(controller, deltaTime);
    controller.actualForce = Vector.scale(
      controller.actualForce,
      this.calculateFriction(controller, deltaTime)
    );
    controller.actualForce = Vector.scale(controller.actualForce, this.engineBraking(controller, deltaTime));
    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;
    controller.turning();
    if (controller.steeringForce !== 0 && !controller.isTurning) {
      controller.steeringForce =
        Math.round(
          (controller.steeringForce - 60 * deltaTime * 0.05 * Math.sign(controller.steeringForce)) * 100
        ) / 100;
    }
    controller.isTurning = false;
    //controller.enterNitroMode()
  }

  handleCollision(controller: PhysicsBasedController, collisionPoint: Vec2D, trackCollider: number[][]) {
    if (!collisionPoint) {
      return;
    }
    const displayDriver = DisplayDriver.currentInstance;

    const approachVector = Vector.subtract(controller.centerPosition, collisionPoint as Vec2D);
    const normalizedNormal = Vector.normalize(approachVector);

    const SPEED_LOSS = 0.7;
    controller.actualForce = Vector.scale(controller.actualForce, SPEED_LOSS);

    //? Miejsce zderzenia w tablicy trackCollider
    const gridX = Math.round(collisionPoint.x / displayDriver!.scaler);
    const gridY = Math.round(collisionPoint.y / displayDriver!.scaler);
    const points: Vec2D[] = [];

    const pattern = 1;
    for (let dx = -pattern; dx <= pattern; dx++) {
      for (let dy = -pattern; dy <= pattern; dy++) {
        if (dy === 0 && dx === 0) continue;
        if (trackCollider[gridY + dy] && trackCollider[gridY + dy][gridX + dx] === 1) {
          points.push({ x: (gridX + dx) * displayDriver!.scaler, y: (gridY + dy) * displayDriver!.scaler });
        }
      }
    }

    for (let p = 0; p < points.length - 1; p++)
      displayDriver?.drawLineBetweenVectors(points[p], points[p + 1], "green");

    const x = PhysicsUtils.linearRegression(points);

    let normal: Vec2D;

    if (x[0] === Infinity) {
      const xValue = x[1];
      const pointA = { x: xValue, y: 0 };
      const pointB = { x: xValue, y: 1000 };
      displayDriver?.drawLineBetweenVectors(pointA, pointB, "blue");

      normal = { x: 1, y: 0 };
    } else {
      const pointA = { x: 0, y: x[1] };
      const pointB = { x: 1000, y: x[0] * 1000 + x[1] };
      displayDriver?.drawLineBetweenVectors(pointA, pointB, "blue");

      normal = Vector.normalize({ x: -x[0], y: 1 });
    }

    //? Odwrocenie normlanej jesli jest5 zle skierowana (nie wiem czemu ale śmiga :) )
    if (Vector.dot(normal, approachVector) > 0) {
      normal = Vector.scale(normal, -1);
    }

    const dotProduct = Vector.dot(controller.actualForce, normal);
    const reflection = Vector.subtract(controller.actualForce, Vector.scale(normal, 2 * dotProduct));

    controller.actualForce = Vector.scale(reflection, SPEED_LOSS);

    const impactAngle = Math.atan2(controller.actualForce.y, controller.actualForce.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    const angleDifference = Math.atan2(
      Math.sin(impactAngle - normalAngle),
      Math.cos(impactAngle - normalAngle)
    );
    // console.log(
    //   "impactAngle:",
    //   impactAngle,
    //   "normalAngle:",
    //   normalAngle,
    //   "angleDifference:",
    //   angleDifference
    // );
    // console.log("actualForce przed odbiciem:", controller.actualForce);
    // console.log("normal vector:", normal);

    controller.rotate(angleDifference * 3);

    controller.setPosition(Vector.add(controller.position, Vector.scale(normalizedNormal, 2)));

    controller.setCurrentSprite();
    GameTimeline.setTimeout(() => {
      this.isColliding = false;
    }, 50);
  }

  handleCollisionBetweenControllers(
    controller1: PhysicsBasedController,
    controller2: PhysicsBasedController
  ) {
    const normal = Vector.normalize(Vector.subtract(controller1.position, controller2.position));
    const relativeVelocity = Vector.subtract(controller1.velocity, controller2.velocity);
    const speedAlongNormal = Vector.dot(relativeVelocity, normal);

    if (speedAlongNormal > 0) return; // Objects are separating

    const RESTITUTION = 0.8; // Elasticity factor
    const impulseMagnitude = (-(1 + RESTITUTION) * speedAlongNormal) / 2;
    const impulse = Vector.scale(normal, impulseMagnitude);

    controller1.velocity = Vector.add(controller1.velocity, impulse);
    controller2.velocity = Vector.subtract(controller2.velocity, impulse);

    controller1.setPosition(Vector.add(controller1.position, Vector.scale(normal, 1)));
    controller2.setPosition(Vector.subtract(controller2.position, Vector.scale(normal, 1)));
  }

  calculateActualForce(controller: PhysicsBasedController, deltaTime: number) {
    controller.actualForce = Vector.add(
      controller.actualForce,
      Vector.scale(controller.acceleration, deltaTime * 60)
    );
    controller.actualForce = PhysicsUtils.normalizeForceToAngle(
      controller.actualForce,
      controller.angle,
      0.05
    );
    controller.acceleration = { x: 0, y: 0 };
  }

  calculateFriction(controller: PhysicsBasedController, deltaTime: number) {
    let deltatimeMultiplicator = 1;
    if (deltaTime !== 0) {
      deltatimeMultiplicator = 1 / (60 * deltaTime);
    }

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
        (1 -
          (0.002 +
            controller.mapAdhesion * controller.currentAdhesionModifier * frictionAmount * 0.03 +
            controller.brakingForce) *
            deltatimeMultiplicator) *
          1000
      ) / 1000;

    controller.brakingForce = 0;
    return frictionFactor;
  }

  engineBraking(controller: PhysicsBasedController, deltaTime: number) {
    const curSpeed = Vector.length(controller.actualForce);
    const engineBrakingForce = 1 * deltaTime * 60;
    let engineBrakingValue = 1;
    if (curSpeed !== 0) {
      engineBrakingValue =
        1 - (controller.currentAdhesionModifier * controller.mapAdhesion * engineBrakingForce) / curSpeed;
    }
    return engineBrakingValue;
  }
}

export default PhysicsDriver;
