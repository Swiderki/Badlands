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

    console.log(
      PhysicsUtils.linearRegression([
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ])
    );
    console.log(
      PhysicsUtils.linearRegression([
        { x: 1000, y: 2000 },
        { x: 1001, y: 2001 },
      ])
    );
    console.log(
      PhysicsUtils.linearRegression([
        { x: 0, y: 0 },
        { x: 1000000, y: 1000000 },
      ])
    );

    //* This is a simple physics loop
    this.calculateActualForce(controller);
    controller.actualForce = Vector.scale(controller.actualForce, this.calculateFriction(controller));

    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;
  }

  handleCollision(controller: PhysicsBasedController, collisionPoint: Vec2D, trackCollider: number[][]) {
    if (!collisionPoint) {
      return;
    }
    const displayDriver = DisplayDriver.currentInstance;

    const approachVector = Vector.subtract(controller.centerPosition, collisionPoint as Vec2D);
    const normalizedNormal = Vector.normalize(approachVector);

    // 🌟 Zachowujemy część prędkości zamiast resetować ją do 0
    const SPEED_LOSS = 0.8; // Zmieniaj ten współczynnik, żeby regulować tłumienie
    controller.actualForce = Vector.scale(controller.actualForce, SPEED_LOSS);

    //? Miejsce zderzenia w tablicy trackCollider
    const gridX = Math.round(collisionPoint.x / displayDriver!.scaler);
    const gridY = Math.round(collisionPoint.y / displayDriver!.scaler);
    const points: Vec2D[] = [];

    const pattern = 1;
    for (let dx = -pattern; dx <= pattern; dx++) {
      for (let dy = -pattern; dy <= pattern; dy++) {
        if (trackCollider[gridY + dx] && trackCollider[gridY + dx][gridX + dy] === 1) {
          points.push({ x: (gridX + dx) * 3, y: (gridY + dy) * 3 });
        }
      }
    }

    const x = PhysicsUtils.linearRegression(points);

    console.log(x);
    let normal: Vec2D;

    if (x[0] === Infinity) {
      const xValue = x[1];
      const pointA = { x: xValue, y: 0 };
      const pointB = { x: xValue, y: 1000 };
      displayDriver?.drawLineBetweenVectors(pointA, pointB, "blue");

      // Ściana pionowa => normalna idzie w poziomie
      normal = { x: 1, y: 0 };
    } else {
      const pointA = { x: 0, y: x[1] };
      const pointB = { x: 1000, y: x[0] * 1000 + x[1] };
      displayDriver?.drawLineBetweenVectors(pointA, pointB, "blue");

      // Normalna to wektor prostopadły do bandy (-a, 1) i normalizacja
      normal = Vector.normalize({ x: -x[0], y: 1 });
    }

    // 🔥 **Odbijanie wektora prędkości od bandy**
    const dotProduct = Vector.dot(controller.actualForce, normal);
    const reflection = Vector.subtract(controller.actualForce, Vector.scale(normal, 2 * dotProduct));

    // Zachowanie części prędkości po odbiciu
    controller.actualForce = Vector.scale(reflection, SPEED_LOSS);

    // 🌀 **Dodanie rotacji samochodu w zależności od kąta uderzenia**
    const impactAngle = Math.atan2(controller.actualForce.y, controller.actualForce.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    const angleDifference = ((impactAngle - normalAngle) * 180) / Math.PI;

    // Rotacja auta zależna od kąta odbicia
    controller.rotate(angleDifference * 0.1); // Możesz dostroić ten mnożnik dla lepszego efektu

    // Odsuń trochę auto od ściany, aby uniknąć zapętlenia kolizji
    controller.setPosition(Vector.add(controller.position, Vector.scale(normalizedNormal, 2)));

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
