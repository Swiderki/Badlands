import CollisionManager from "../services/collision/collision-manager";
import DisplayDriver from "../services/display-driver/display-driver";
import MiddleDrivingPolicy from "../controllers/driving-policies/middle-driving-policy";
import OpponentController from "../controllers/opponents-controller";
import PhysicsDriver from "../services/physics-driver/physics-driver";
import PlayerController from "../controllers/player-controller";
import Scene from "./Scene";
import { Sprite } from "@/types/display-driver";
import { StartPosition } from "@/types/track-driver";
import Track from "../services/track-driver/track-driver";
import TrackLoader from "../services/track-driver/track-loader";
import { TrackPath } from "../services/track-driver/track-path";
import { Vec2D } from "@/types/physics";
import { Vector } from "../util/vec-util";
import { getCarCorners } from "../util/collision-util";
import { UIService } from "../services/ui-service/ui-service";
import { Scoreboard } from "../services/scoreboard/scoreboard";
import Game from "../services/game";
import EffectObject from "../services/effect/effect-object";
import { getRandomObstacles, getRandomPerks } from "../util/effects-utils";
import { CollisionObject } from "@/types/collision";
import TimedEffectDriver from "../services/effect/timed-effect-driver";

class GameScene extends Scene {
  private displayDriver: DisplayDriver;
  private playerController: PlayerController | null = null;
  private opponentControllersList: OpponentController[] = [];
  private track: Track | null = null;
  private collisionManager: CollisionManager;
  private physicsDriver: PhysicsDriver;
  private UiService: UIService;
  private scoreboard: Scoreboard = Scoreboard.instance;
  private effectObject: EffectObject[] = [];
  private timedEffectDriver: TimedEffectDriver = new TimedEffectDriver();
  private playerCar: string;
  private playerColor: string;
  private map: string;

  //* Element ref
  sceneRef: HTMLElement | null = null;
  constructor(displayDriver: DisplayDriver, car: string, color: string, map: string) {
    super();
    this.playerCar = car;
    this.playerColor = color;
    this.map = map;
    this.displayDriver = displayDriver;
    this.physicsDriver = new PhysicsDriver();
    this.UiService = UIService.getInstance();
    this.collisionManager = new CollisionManager(this.displayDriver.scaler);
  }

  async init() {
    this.sceneRef = document.querySelector("#game-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";

    this.track = await TrackLoader.loadTrack(this.displayDriver, "/assets/tracks/test-track.json");
    this.UiService.generateScoreboard();
    this.scoreboard.currentLap = 1;
    await this.loadPlayer(this.track.startPositions[0]);
    await this.loadOpponents(
      this.track.startPositions.slice(1),
      this.track.checkPointPath!,
      this.displayDriver.scaler
    );
    await this.loadEffectObjects();
  }

  override onMount() {
    this.sceneRef = document.querySelector("#game-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    this.sceneRef = document.querySelector("#game-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "none";
  }

  private async loadPlayer(startPosition: StartPosition) {
    const spriteName = `${this.playerCar}_${this.playerColor}`;
    console.log(spriteName);
    const playerSprite = this.displayDriver.getSprite(spriteName);
    if (!playerSprite) {
      throw new Error("Failed to get player sprite");
    }
    this.playerController = new PlayerController(playerSprite, startPosition);
  }

  private async loadOpponents(startPositions: StartPosition[], checkPointPath: TrackPath, scaler: number) {
    const opponentSprite = this.displayDriver.getSprite("peugeot_blue");
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

  private async loadEffectObjects() {
    const randomObstacles = getRandomObstacles(3);
    this.effectObject.push(...randomObstacles);

    const addPerk = () => {
      const randomPerks = getRandomPerks(1);
      randomPerks.forEach((perk) => {
        const index = this.effectObject.length;
        perk._onEnter = () => {
          console.log("_onEnter");
          delete this.effectObject[index];
          addPerk();
        };
        this.effectObject.push(perk);
      });
    };

    addPerk();
  }

  update(deltaTime: number) {
    this.trackUpdate();
    this.playerUpdate(deltaTime);
    this.opponentsUpdate(deltaTime);
    this.collisionUpdate();
    this.effectUpdate();
    this.scoreUpdate();
    this.uiUpdate();
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
    //! DEV: Draw player has boost effect
    if (this.timedEffectDriver.effects) {
      this.displayDriver.ctx.rect(
        this.playerController.displayData.position.x,
        this.playerController.displayData.position.y,
        10,
        10
      );
      if (this.timedEffectDriver.hasEffect("boost")) {
        this.displayDriver.ctx.fillStyle = "green";
      } else if (this.timedEffectDriver.hasEffect("slip")) {
        this.displayDriver.ctx.fillStyle = "yellow";
      } else if (this.timedEffectDriver.hasEffect("damaged")) {
        this.displayDriver.ctx.fillStyle = "red";
      }
      this.displayDriver.ctx.fill();
    }
    this.displayDriver.drawSprite(this.playerController.displayData);
  }

  private opponentsUpdate(deltaTime: number) {
    if (this.opponentControllersList.length === 0) {
      return;
    }

    for (const opponent of this.opponentControllersList) {
      opponent.update(deltaTime);
      this.physicsDriver.updateController(opponent, deltaTime);
      this.displayDriver.drawSprite(opponent.displayData);
    }
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
        this.collisionManager.isCollidingWithTrack(playerCorners, trackCollider)!,
        trackCollider
      );
    }
  }

  private effectUpdate() {
    if (!this.playerController) {
      return;
    }

    this.effectObject.forEach((obstacle) => {
      this.displayDriver.drawSprite({
        sprite: obstacle.sprite,
        position: obstacle.position,
        currentSprite: 0,
      });

      const playerCorners = getCarCorners(
        this.playerController!.displayData.position,
        this.playerController!.colliderHeight,
        this.playerController!.colliderWidth,
        this.playerController!.angle
      );

      const isColliding = this.collisionManager.isCollidingWithAnotherObject(
        playerCorners,
        obstacle.collision
      );

      obstacle._update(isColliding);
    });
    this.timedEffectDriver.update();
  }

  private uiUpdate() {
    if (!this.playerController) {
      return;
    }

    const t =
      (Vector.length(this.playerController.actualForce) / this.playerController.currentMaxSpeedForward) * 270;
    this.UiService.setSpeedMeterValue(t);

    this.UiService.setAccMeterValue(Math.min(t, 240) + 30);
  }

  private scoreUpdate() {
    if (!this.playerController || !this.track || !this.track.checkPointPath) {
      return;
    }
    const distanceToNextCheckpoint = this.track.checkPointPath.getDistanceToPoint(
      this.playerController.centerPosition,
      this.scoreboard.currentCheckpoint
    );

    if (
      (distanceToNextCheckpoint < 30 &&
        this.scoreboard.currentCheckpoint !== this.track.checkPointPath.sampledPoints.length) ||
      (distanceToNextCheckpoint < 2 &&
        this.scoreboard.currentCheckpoint === this.track.checkPointPath.sampledPoints.length) ||
      isNaN(distanceToNextCheckpoint)
    ) {
      this.scoreboard.currentCheckpoint++;
    }

    this.UiService.setCurrentTime(this.scoreboard.currentTime);
    // console.log(this.scoreboard.currentLapTime);
    this.UiService.setCurrentLapTime(this.scoreboard.currentLapTime);

    if (this.scoreboard.currentCheckpoint === this.track.checkPointPath.sampledPoints.length) {
      this.scoreboard.currentLap++;
      this.scoreboard.currentCheckpoint = 1;
    }

    if (this.scoreboard.currentLap === this.UiService.lapCount) {
      Game.instance.startResultScene();
    }
  }
}

export default GameScene;
