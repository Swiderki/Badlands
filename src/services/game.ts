import PlayerController from "../controllers/player-controller";
import OpponentController from "../controllers/opponents-controller";
import MiddleDrivingPolicy from "../controllers/driving-policies/middle-driving-policy";
import CollisionManager from "./collision/collision-manager";
import DisplayDriver from "./display-driver/display-driver";
import PhysicsDriver from "./physics-driver/physics-driver";
import Track from "./track-driver/track-driver";
import TrackLoader from "./track-driver/track-loader";
import { StartPosition } from "@/types/track-driver";
import { getCarCorners } from "../util/collision-util";

import PhysicsBasedController from "../controllers/physics-based-controller";
import { Vector } from "../util/vec-util";

import { TrackPath } from "./track-driver/trackpath";

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

  private opponentControllersList: OpponentController[] = [];


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
    this.loadPlayer(this.track.startPositions[0]);
    this.loadOpponents(this.track.startPositions.slice(1), this.track.checkPointPath!, this.displayDriver.scaler);
    
    //* Start the game loop
    this._update();
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
    this.opponentControllersList.push(new OpponentController(opponentSprite, startPositions[0], new MiddleDrivingPolicy(checkPointPath, scaler)));
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
    this.opponentsUpdate(deltaTime);
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
    this.physicsDriver.updateController(this.botController!, deltaTime);
    this.displayDriver.drawSprite(this.playerController.displayData);
    this.displayDriver.drawSprite(this.botController!.displayData);
  }

  private opponentsUpdate(deltaTime: number) {
    if (this.opponentControllersList.length === 0) {
      return;
    }

    this.opponentControllersList.forEach(opponent => {
      opponent.update(deltaTime);
      this.physicsDriver.updateController(opponent, deltaTime);
      this.displayDriver.drawSprite(opponent.displayData);
    });
    
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


    //* === Temporary =======================================================================

    const opponentCorners = getCarCorners(
      this.opponentControllersList[0].displayData.position,
      this.opponentControllersList[0].colliderHeight,
      this.opponentControllersList[0].colliderWidth,
      this.opponentControllersList[0].angle
    );

    this.displayDriver.displayColliderCorners(
      opponentCorners,
      this.opponentControllersList[0].centerPosition,
      this.opponentControllersList[0].angle
    );

    //* =====================================================================================

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
