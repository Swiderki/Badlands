import PlayerController from "../controllers/player-controller";
import CollisionManager from "./collision/collision-manager";
import DisplayDriver from "./display-driver/display-driver";
import PhysicsDriver from "./physics-driver/physics-driver";
import Track from "./track-driver/track-driver";
import TrackLoader from "./track-driver/track-loader";
import { getCarCorners } from "../util/collision-util";
import PhysicsBasedController from "../controllers/physics-based-controller";
class Game {
  //* Drivers
  displayDriver: DisplayDriver;
  physicsDriver: PhysicsDriver;
  collisionManager: CollisionManager;
  track: Track | null = null;

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;

  private playerController: PlayerController | null = null; //* In the there will be Player Controller class
  private botController: PhysicsBasedController | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);
    this.physicsDriver = new PhysicsDriver();
    this.collisionManager = new CollisionManager(this.displayDriver.scaler);
  }

  async start() {
    this.displayDriver.setResolution(320, 182);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();
    this.track = await TrackLoader.loadTrack(this.displayDriver, "/assets/tracks/test-track.json");

    //* In the future there will be separate function to do all the loading, as for now it's here
    const playerSprite = this.displayDriver.getSprite("peugeot");
    if (!playerSprite) {
      throw new Error("Failed to get sprite");
    }

    const playerStartingPositon = this.track.startPositions[0];

    const botPosition = this.track.startPositions[1];
    const botSprite = this.displayDriver.getSprite("peugeot");
    if (!botSprite) {
      throw new Error("Failed to get sprite");
    }

    this.botController = new PhysicsBasedController(botSprite, botPosition);
    this.playerController = new PlayerController(playerSprite, playerStartingPositon);

    //* Start the game loop
    this._update();
  }

  //* This method is called every frame, but it should be free of any game logic
  //* It's only purpose is to keep FPS stable
  //* It prevents the game from running too fast or too slow
  //! For any game logic check out the update method
  private _update() {
    this.displayDriver.clear();
    const deltaTime = (this._lastRenderTime - this._penultimateRenderTime) / 1000;

    this.update(deltaTime);

    requestAnimationFrame((renderTime) => {
      this._penultimateRenderTime = this._lastRenderTime;
      this._lastRenderTime = renderTime;
      this._update();
    });
  }

  update(deltaTime: number) {
    this.trackUpdate();
    this.playerUpdate(deltaTime);
    this.collisionUpdate();

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

    this.botController?.update(deltaTime);
    this.physicsDriver.updateController(this.playerController, deltaTime);
    this.displayDriver.drawSprite(this.playerController.displayData);
    this.displayDriver.drawSprite(this.botController!.displayData);
  }

  private collisionUpdate() {
    if (!this.track || !this.track.colliderImage || !this.playerController) {
      return;
    }

    //* Handle player collision with track
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

    const botCorners = getCarCorners(
      this.botController!.displayData.position,
      this.botController!.colliderHeight,
      this.botController!.colliderWidth,
      this.botController!.angle
    );

    this.displayDriver.displayColliderCorners(
      botCorners,
      this.botController!.centerPosition,
      this.botController!.angle
    );

    const playerCollider = {
      x: this.playerController.centerPosition.x,
      y: this.playerController.centerPosition.y,
      width: this.playerController.colliderWidth,
      height: this.playerController.colliderHeight,
      angle: this.playerController.angle,
    };
    const botCollider = {
      x: this.botController!.centerPosition.x,
      y: this.botController!.centerPosition.y,
      width: this.botController!.colliderWidth,
      height: this.botController!.colliderHeight,
      angle: this.botController!.angle,
    };

    if (this.collisionManager.isCollidingWithAnotherObject(playerCollider, botCollider)) {
      console.log(123);
    }

    const trackCollider = this.track.colliderImage;
    if (this.collisionManager.isCollidingWithTrack(playerCorners, trackCollider) !== null) {
      this.displayDriver.displayCollisionEffect(); //* It's easier to
      //* Here add the code for collision handling
      this.physicsDriver.handleCollision(
        this.playerController,
        this.collisionManager.isCollidingWithTrack(playerCorners, trackCollider)!,
        trackCollider

      );
    }
  }
}

export default Game;
