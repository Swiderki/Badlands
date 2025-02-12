import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { Vector } from "@/src/util/vec-util";

//* We use separate drivers for physics and display to separate concerns
//* Also we don't preform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    //* This is a simple physics loop
    const newVelocity = Vector.add(controller.velocity, Vector.scale(controller.acceleration, deltaTime));
    const newPosition = Vector.add(controller.position, Vector.scale(newVelocity, deltaTime));

    controller.velocity = newVelocity;
    controller.position = newPosition;

    //? The physics loop will be more complex but for now we keep it simple
  }
}

export default PhysicsDriver;
