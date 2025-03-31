import { StartPosition } from "@/types/track-driver";
import MiddleDrivingPolicy from "../controllers/driving-policies/middle-driving-policy";
import StraightMasterDrivingPolicy from "../controllers/driving-policies/straight-master-driving-policy";
import AggressiveDrivingPolicy from "../controllers/driving-policies/aggressive-driving-policy";
import SuperAggressiveDrivingPolicy from "../controllers/driving-policies/super-aggressive-driving-policy";
import OpponentController from "../controllers/opponents-controller";
import PlayerController from "../controllers/player-controller";
import CollisionHandlers from "../services/collision/collision-handlers";
import CollisionManager from "../services/collision/collision-manager";
import { displayGameDebugInfo } from "../services/display-driver/display-debug";
import DisplayDriver from "../services/display-driver/display-driver";
import EffectObject from "../services/effect/effect-object";
import GravelObstacle from "../services/effect/obstacle/gravel-obstacle";
import IceObstacle from "../services/effect/obstacle/ice-obstacle";
import Game from "../services/game";
import { startGameWithCountdown } from "../services/game-logic/countdown";
import PhysicsDriver from "../services/physics-driver/physics-driver";
import { Scoreboard } from "../services/scoreboard/scoreboard";
import { EnemyPath } from "../services/track-driver/enemy-path";
import Track from "../services/track-driver/track-driver";
import TrackLoader from "../services/track-driver/track-loader";
import { TrackPath } from "../services/track-driver/track-path";
import { UIService } from "../services/ui-service/ui-service";
import assert from "../util/assert";
import { getRandomObstacles, getRandomPerks } from "../util/effects-utils";
import { Vector } from "../util/vec-util";
import Scene from "./_scene";

class GameScene extends Scene {
  displayDriver: DisplayDriver;
  playerController: PlayerController | null = null;
  opponentControllersList: OpponentController[] = [];
  track: Track | null = null;
  effectObjects: EffectObject[] = [];
  collisionManager: CollisionManager;
  physicsDriver: PhysicsDriver;
  UiService: UIService;
  private music: HTMLAudioElement = new Audio("/assets/sounds/game_theme.wav");

  debugActive = true;
  private scoreboard: Scoreboard = Scoreboard.instance;
  private playerCar: string;
  private playerColor: string;
  private map: string;
  static instance: GameScene;
  static getInstance(): GameScene {
    if (!GameScene.instance) {
      throw new Error("Game instance not initialized");
    }
    return GameScene.instance;
  }

  //* Element ref
  sceneRef: HTMLElement | null = null;

  constructor(displayDriver: DisplayDriver, car: string, color: string, map: string) {
    super();
    GameScene.instance = this;
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
    this.UiService.hideSkipButton();

    this.track = await TrackLoader.loadTrack(this.displayDriver, `/assets/tracks/${this.map}/track.json`);

    this.UiService.generateScoreboard();
    this.scoreboard.currentLap = 0;
    this.scoreboard.resetCurrentTime();

    await this.loadPlayer(this.track.startPositions[0], this.track.traction);
    await this.loadOpponents(
      this.track.startPositions.slice(1),
      this.track.checkPointPath!,
      this.displayDriver.scaler,
      this.track.traction
    );
    await this.initEffectObjects();
    await startGameWithCountdown();
    this.music.loop = true;
    this.music.play().catch((err) => console.error("Failed to play background music:", err));
    this.initListeners();
  }

  private initListeners() {
    const game = Game.getInstance();

    //* i've added keypress listener instead of keydown to prevent just holding key
    document.addEventListener("keypress", (e) => {
      if (e.key === " ") {
        const obstacle = this.playerController?.dropObstacle();
        if (!obstacle) return;
        this.effectObjects.push(obstacle);
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        if (game.pauseDetails.isPaused) {
          game.resumeGame();
        } else {
          game.pauseGame();
        }
      }
    });

    window.addEventListener("focus", () => {
      // if windows state is unknown then it means that is has not been focused but BeforeUpdate shouldn't be called
      if (game.pauseDetails.isWindowActive === null) return;
      game.pauseDetails.isWindowActive = true;
      game.resumeGame();
    });

    window.addEventListener("blur", () => {
      game.pauseDetails.isWindowActive = false;
      game.pauseGame();
    });
  }

  override onMount() {
    this.sceneRef = document.querySelector("#game-scene");
    assert(this.sceneRef, "Game scene not initialized");
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    assert(this.sceneRef, "Game scene not initialized");
    this.sceneRef.style.display = "none";
    this.music.pause();
    this.music.currentTime = 0;
  }

  private async loadPlayer(startPosition: StartPosition, traction: number) {
    const spriteName = `${this.playerCar}_${this.playerColor}`;
    const playerSprite = this.displayDriver.getSprite(spriteName);
    assert(playerSprite, "Failed to get player sprite");
    this.playerController = new PlayerController(playerSprite, startPosition, traction);
  }

  private async loadOpponents(
    startPositions: StartPosition[],
    checkPointPath: TrackPath,
    scaler: number,
    traction: number
  ) {
    const opponentSprite1 = this.displayDriver.getSprite("peugeot_blue");
    const opponentSprite2 = this.displayDriver.getSprite("peugeot_green");
    const opponentSprite3 = this.displayDriver.getSprite("peugeot_pink");
    const opponentSprite4 = this.displayDriver.getSprite("peugeot_black");

    assert(opponentSprite1, "Failed to get opponent sprite");
    assert(opponentSprite2, "Failed to get opponent sprite");
    assert(opponentSprite3, "Failed to get opponent sprite");
    assert(opponentSprite4, "Failed to get opponent sprite");

    //* Create Middle driving enemy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite1,
        startPositions[0],
        new MiddleDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, 20), scaler),
        "Bob",
        traction
      )
    );
    //* Create Middle driving enemy
    //* It will later use BalancedDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite2,
        startPositions[1],
        new StraightMasterDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, 10), scaler),
        "Jack",
        traction
      )
    );
    this.opponentControllersList[this.opponentControllersList.length - 1].currentAccelerationPowerForward += 10;
    //* Create Middle driving enemy
    //* It will later use AggressiveDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite3,
        startPositions[2],
        new AggressiveDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, -20), scaler),
        "NormcnkZJXnvkxjzcnvknjxcal",
        traction
      )
    );
    // * Create Middle driving enemy
    // * It will later use SuperAggressiveDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite4,
        startPositions[3],
        new SuperAggressiveDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, -10), scaler),
        "Middle",
        traction
      )
    );
  }

  private async initEffectObjects() {
    const randomObstacles = getRandomObstacles(3, this.effectObjects);
    this.effectObjects.push(...randomObstacles);
    if (this.map === "snow") {
      this.effectObjects.push(new IceObstacle({ x: 0, y: 0 }));
    } else if (this.map === "gravel") {
      this.effectObjects.push(new GravelObstacle({ x: 650, y: 0 }));
      this.effectObjects.push(new GravelObstacle({ x: 650, y: 300 }));
    }
    console.log(this.effectObjects);

    const addPerk = () => {
      const randomPerks = getRandomPerks(1, this.effectObjects);
      randomPerks.forEach((perk) => {
        const index = this.effectObjects.length;
        perk._onEnter = () => {
          delete this.effectObjects[index];
          addPerk();
        };
        this.effectObjects.push(perk);
      });
    };

    addPerk();
  }

  override update(deltaTime: number) {
    this.trackUpdate();
    this.playerUpdate(deltaTime);
    this.opponentsUpdate(deltaTime);
    this.collisionUpdate(deltaTime);
    this.effectUpdate(deltaTime);
    this.scoreboard.update(this);
    this.uiUpdate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render(_ctx: CanvasRenderingContext2D) {
    if (this.displayDriver === null || this.track === null) {
      return;
    }

    this.displayDriver.displayTrack(this.track);
    this.effectObjects.forEach((obstacle) => {
      this.displayDriver.drawSprite({
        sprite: obstacle.sprite,
        position: obstacle.position,
        currentSprite: obstacle.randomSprite,
      });
      // const corners = getCarCorners({x: obstacle.collision.x, y:obstacle.collision.y},obstacle.collision.width, obstacle.collision.height, obstacle.collision.angle)
      // this.displayDriver.displayColliderCorners(corners,{x: obstacle.collision.x, y:obstacle.collision.y} ,obstacle.collision.angle)
    });
    if (!this.playerController!.finished && !this.playerController!.invisible) {
      this.renderPlayer();
    }
    this.opponentControllersList.forEach((opponent) => {
      if (opponent.finished || opponent.invisible) return;
      this.displayDriver.drawTraces(opponent);
      this.displayDriver.drawSprite(opponent.displayData);
    });

    this.displayDriver.displayTrackFgLayers(this.track);
    this.track.renderGates();

    //* drawCalls used to display things such debug overlay, ensuring that they will be drawn of the top
    displayGameDebugInfo(this);
    this.displayDriver.performDrawCalls();
  }

  renderPlayer() {
    if (!this.playerController) {
      return;
    }
    //! DEV: Draw player has boost effect
    if (this.playerController.timedEffectDriver.effects) {
      const offset = 30;
      if (this.playerController.timedEffectDriver.hasEffect("nitro")) {
        console.log("nitro");
      } else if (this.playerController.timedEffectDriver.hasEffect("boost")) {
        this.displayDriver.drawSprite({
          sprite: this.displayDriver.getSprite("repair-effect")!,
          position: Vector.add(this.playerController.displayData.position, { x: offset, y: 0 }),
          currentSprite: 0,
        });
      } else if (this.playerController.timedEffectDriver.hasEffect("slip")) {
        this.displayDriver.drawSprite({
          sprite: this.displayDriver.getSprite("slip-effect")!,
          position: Vector.add(this.playerController.displayData.position, { x: offset, y: 0 }),
          currentSprite: 0,
        });
      } else if (this.playerController.timedEffectDriver.hasEffect("damaged")) {
        this.displayDriver.drawSprite({
          sprite: this.displayDriver.getSprite("check-engine")!,
          position: Vector.add(this.playerController.displayData.position, { x: offset, y: 0 }),
          currentSprite: 0,
        });
      } else if (this.playerController.timedEffectDriver.hasEffect("freeze")) {
        this.displayDriver.drawSprite({
          sprite: this.displayDriver.getSprite("freeze-effect")!,
          position: Vector.add(this.playerController.displayData.position, { x: offset, y: 0 }),
          currentSprite: 0,
        });
      }
      this.displayDriver.ctx.fill();
    }
    this.displayDriver.drawTraces(this.playerController);
    this.displayDriver.drawSprite(this.playerController.displayData);
  }

  private trackUpdate() {
    if (this.track === null) {
      return;
    }
    this.track.update();
    if (this.track.isRainy) {
      this.displayDriver.drawRain();
    }
  }

  private playerUpdate(deltaTime: number) {
    if (!this.playerController || !this.playerController.displayData) {
      return;
    }
    if (this.playerController.finished) return;

    this.playerController.update(deltaTime);
    this.physicsDriver.updateController(this.playerController, deltaTime);
  }

  private opponentsUpdate(deltaTime: number) {
    if (this.opponentControllersList.length === 0) {
      return;
    }

    for (const opponent of this.opponentControllersList) {
      if (opponent.finished) continue;
      opponent.update(deltaTime);
      this.physicsDriver.updateController(opponent, deltaTime);
    }
  }

  private collisionUpdate(deltaTime: number) {
    CollisionHandlers.handleCollisionsBetweenControllers(this);
    CollisionHandlers.handleCollisionChecks(this, deltaTime);
  }

  private effectUpdate(deltaTime: number) {
    if (!this.playerController) {
      return;
    }

    CollisionHandlers.handleEffectObjectsCollisions(this);

    this.playerController.timedEffectDriver.update(deltaTime);
    this.opponentControllersList.forEach((opponent) => opponent.timedEffectDriver.update(deltaTime));
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
}

export default GameScene;
