import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Vector } from "@/src/util/vec-util";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't preform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    //* This is a simple physics loop

    this.calculateActualForce(controller);
    controller.actualForce = Vector.scale(controller.actualForce, this.calculateFriction(controller));

    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;

    //? The physics loop will be more complex but for now we keep it simple
  }

  calculateActualForce(controller: PhysicsBasedController) {
    controller.actualForce = Vector.add(controller.actualForce, controller.acceleration);
    controller.actualForce = Vector.maxLenght(controller.actualForce, 400); // predkosc maksymalna powinna byc zczytywana z obietku autka, ktorego max predosc bedzie sie zmieniać np. przez nitro

    controller.acceleration = { x: 0, y: 0 };
  }

  calculateFriction(controller: PhysicsBasedController) {
    const differenceInAngle = (Math.abs(Vector.angle(controller.actualForce) - controller.angle) % 180) / 180;
    const noFrictionValue = 0.2;
    const frictionAmount =
      Math.round(
        Math.max(0, Math.sin(differenceInAngle * (3.14 + 2 * noFrictionValue) - noFrictionValue)) * 100
      ) / 100;
    // bardzo zabawne obliczenia
    // powyższy komentarz należy usunąć w finalnej wersji projektu

    const mapAdesion = 0.8; // ta wartosc powinna pochodzić z mapy, ale to jeszcze nie zostało zaimplementowane
    const frictionFactor = Math.round((1 - mapAdesion * frictionAmount * 0.1) * 1000) / 1000;

    return frictionFactor;
  }
}

export default PhysicsDriver;
