import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Vector } from "@/src/util/vec-util";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't preform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  //* TRACK INFO REF WILL BE HERE
  private frictionCoefficient = 0.97;

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    //* This is a simple physics laoop

    this.calculateActualForce(controller);
    controller.actualForce = Vector.scale(controller.actualForce, this.frictionCoefficient);
    controller.acceleration = Vector.scale(controller.acceleration, this.frictionCoefficient);

    const newPosition = Vector.add(controller.position, Vector.scale(controller.actualForce, deltaTime));
    controller.position = newPosition;

    //? The physics loop will be more complex but for now we keep it simple
  }

  calculateActualForce(controller: PhysicsBasedController) {
    controller.actualForce = Vector.add(controller.actualForce, controller.acceleration);
  }
}

export default PhysicsDriver;
