import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import GameScene from "@/src/scenes/GameScene";
import { getCarCorners } from "@/src/util/collision-util";

export default class CollisionHandlers {
  static handleEffectObjectsCollisions(gameScene: GameScene) {
    const { effectObjects, playerController, collisionManager, opponentControllersList } = gameScene;

    effectObjects.forEach((obstacle) => {
      const playerCorners = getCarCorners(
        playerController!.displayData.position,
        playerController!.colliderHeight,
        playerController!.colliderWidth,
        playerController!.angle
      );

      const collidingCars: PhysicsBasedController[] = [];

      const isPlayerColliding = collisionManager.isCollidingWithAnotherObject(
        playerCorners,
        obstacle.collision
      );

      if (isPlayerColliding && !playerController!.noCollision) {
        collidingCars.push(playerController!);
      }

      opponentControllersList.forEach((opponent) => {
        const opponentCorners = getCarCorners(
          opponent.displayData.position,
          opponent.colliderHeight,
          opponent.colliderWidth,
          opponent.angle
        );

        if (
          collisionManager.isCollidingWithAnotherObject(opponentCorners, obstacle.collision) &&
          !opponent.noCollision
        ) {
          collidingCars.push(opponent);
        }
      });
      obstacle._update(collidingCars);
    });
  }

  static handleCollisionChecks(gameScene: GameScene, deltaTime: number) {
    const {
      playerController,
      collisionManager,
      opponentControllersList,
      displayDriver,
      physicsDriver,
      track,
    } = gameScene;

    if (!track || !track.colliderImage || !playerController) {
      return;
    }

    const playerCorners = getCarCorners(
      playerController.displayData.position,
      playerController.colliderHeight,
      playerController.colliderWidth,
      playerController.angle
    );

    displayDriver.displayColliderCorners(
      playerCorners,
      playerController.centerPosition,
      playerController.angle
    );

    const trackCollider = track.colliderImage;
    if (collisionManager.isCollidingWithTrack(playerCorners, trackCollider) !== null) {
      displayDriver.displayCollisionEffect();
      physicsDriver.handleCollision(
        playerController,
        collisionManager.isCollidingWithTrack(playerCorners, trackCollider)!,
        trackCollider, deltaTime
      );
    }

    opponentControllersList.forEach((opponent) => {
      const opponentCorners = getCarCorners(
        opponent.displayData.position,
        opponent.colliderHeight,
        opponent.colliderWidth,
        opponent.angle
      );

      if (collisionManager.isCollidingWithTrack(opponentCorners, trackCollider) !== null) {
        physicsDriver.handleCollision(
          opponent,
          collisionManager.isCollidingWithTrack(opponentCorners, trackCollider)!,
          trackCollider, deltaTime
        );
      }
    });
  }

  static handleCollisionsBetweenControllers(gameScene: GameScene) {
    const { playerController, collisionManager, opponentControllersList, physicsDriver } = gameScene;
    if (!playerController) {
      return;
    }

    //* Take note that if we check all collisions of the opponents we don't need to bother with player collisions
    for (const opponent of opponentControllersList) {
      //* Handle player enemy collisions
      if (
        collisionManager.isCollidingWithAnotherObject(playerController.collision, opponent.collision) &&
        !playerController.noCollision &&
        !opponent.noCollision
      ) {
        physicsDriver.handleCollisionBetweenControllers(playerController, opponent);
      }

      //* Handle enemy enemy collisions
      opponentControllersList.forEach((opponent2) => {
        if (opponent === opponent2 || opponent.noCollision || opponent2.noCollision) {
          return;
        }
        if (collisionManager.isCollidingWithAnotherObject(opponent.collision, opponent2.collision)) {
          physicsDriver.handleCollisionBetweenControllers(opponent, opponent2);
        }
      });
    }
  }
}
