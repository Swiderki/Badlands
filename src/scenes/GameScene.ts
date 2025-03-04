import CollisionManager from "../services/collision/collision-manager";
import DisplayDriver from "../services/display-driver/display-driver";
import MiddleDrivingPolicy from "../controllers/driving-policies/middle-driving-policy";
import OpponentController from "../controllers/opponents-controller";
import PhysicsDriver from "../services/physics-driver/physics-driver";
import PlayerController from "../controllers/player-controller";
import Scene from "./Scene";
import { StartPosition } from "@/types/track-driver";
import Track from "../services/track-driver/track-driver";
import TrackLoader from "../services/track-driver/track-loader";
import { TrackPath } from "../services/track-driver/trackpath";
import { getCarCorners } from "../util/collision-util";

class GameScene extends Scene {
  private displayDriver: DisplayDriver;
  private playerController: PlayerController | null = null;
  private opponentControllersList: OpponentController[] = [];
  private track: Track | null = null;
  private collisionManager: CollisionManager;
  private physicsDriver: PhysicsDriver;

  constructor(displayDriver: DisplayDriver) {
    super();
    this.displayDriver = displayDriver;
    this.physicsDriver = new PhysicsDriver();
    this.collisionManager = new CollisionManager(this.displayDriver.scaler);
  }

  async init() {
    this.track = await TrackLoader.loadTrack(this.displayDriver, "/assets/tracks/test-track.json");
    await this.loadPlayer(this.track.startPositions[0]);
    await this.loadOpponents(
      this.track.startPositions.slice(1),
      this.track.checkPointPath!,
      this.displayDriver.scaler
    );
  }

  private async loadPlayer(startPosition: StartPosition) {
    const playerSprite = this.displayDriver.getSprite("peugeot");
    if (!playerSprite) {
      throw new Error("Failed to get player sprite");
    }
    this.playerController = new PlayerController(playerSprite, startPosition);
  }

  private async loadOpponents(startPositions: StartPosition[], checkPointPath: TrackPath, scaler: number) {
    const opponentSprite = this.displayDriver.getSprite("peugeot");
    if (!opponentSprite) {
      throw new Error("Failed to get opponent sprite");
    }
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite,
        startPositions[0],
        new MiddleDrivingPolicy(checkPointPath, scaler)
      )
    );
  }

  update(deltaTime: number) {
    this.trackUpdate();
    this.playerUpdate(deltaTime);
    this.opponentsUpdate(deltaTime);
    this.collisionUpdate();
  }

  render(_ctx: CanvasRenderingContext2D) {
    this.displayDriver.performDrawCalls();
  }

  private trackUpdate() {
    if (this.track === null) {
      return;
    }

    this.displayDriver.displayTrack(this.track);
    this.track.displayCheckpoints(this.displayDriver);
  }

  private playerUpdate(deltaTime: number) {
    if (!this.playerController || !this.playerController.displayData) {
      return;
    }

    this.playerController.update(deltaTime);
    this.physicsDriver.updateController(this.playerController, deltaTime);
    this.displayDriver.drawSprite(this.playerController.displayData);
  }

  private opponentsUpdate(deltaTime: number) {
    if (this.opponentControllersList.length === 0) {
      return;
    }

    this.opponentControllersList.forEach((opponent) => {
      opponent.update(deltaTime);
      this.physicsDriver.updateController(opponent, deltaTime);
      this.displayDriver.drawSprite(opponent.displayData);
    });
  }

  private collisionUpdate() {
    if (!this.track || !this.track.colliderImage || !this.playerController) {
      return;
    }

    const playerCorners = getCarCorners(
      this.playerController.displayData.position,
      this.playerController.colliderHeight,
      this.playerController.colliderWidth,
      this.playerController.angle
    );

    this.displayDriver.displayColliderCorners(
      playerCorners,
      this.playerController.centerPosition,
      this.playerController.angle
    );

    const trackCollider = this.track.colliderImage;
    if (this.collisionManager.isCollidingWithTrack(playerCorners, trackCollider) !== null) {
      this.displayDriver.displayCollisionEffect();
      this.physicsDriver.handleCollision(
        this.playerController,
        this.collisionManager.isCollidingWithTrack(playerCorners, trackCollider)!
      );
    }
  }
}

export default GameScene;
