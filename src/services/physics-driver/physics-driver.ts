import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Vector } from "@/src/util/vec-util";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't preform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    //* This is a simple physics laoop

    this.calculateActualForce(controller);
    controller.actualForce = Vector.scale(controller.actualForce, this.calculateEnvironmentFriction());
    //controller.acceleration = Vector.scale(controller.acceleration, this.calculateEnvironmentFriction());

    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;

    //? The physics loop will be more complex but for now we keep it simple
  }

  calculateActualForce(controller: PhysicsBasedController) {
    controller.actualForce = Vector.add(controller.actualForce, controller.acceleration);
    controller.acceleration = { x: 0, y: 0 };
  }

  calculateEnvironmentFriction() {
    const mapAdesion = 0.1; // ta wartosc powinna pochodzić z mapy, ale to jeszcze nie zostało zaimplementowane
    const ratio = 0.97; // ratio of how much air friction affects the car compared to ground friction
    const frictionFactor = ratio + (1 - ratio) * (1 - mapAdesion);
    return frictionFactor;
  }
}

export default PhysicsDriver;
