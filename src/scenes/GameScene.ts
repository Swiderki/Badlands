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
import { TrackPath } from "../services/track-driver/track-path";
import { Vector } from "../util/vec-util";
import { getCarCorners } from "../util/collision-util";
import { UIService } from "../services/ui-service/ui-service";
import { Scoreboard } from "../services/scoreboard/scoreboard";
import Game from "../services/game";
import EffectObject from "../services/effect/effect-object";
import { getRandomObstacles, getRandomPerks } from "../util/effects-utils";
import PhysicsBasedController from "../controllers/physics-based-controller";
import { EnemyPath } from "../services/track-driver/enemy-path";

class GameScene extends Scene {
  private displayDriver: DisplayDriver;
  private playerController: PlayerController | null = null;
  //! It Should be private
  opponentControllersList: OpponentController[] = [];
  private track: Track | null = null;
  private collisionManager: CollisionManager;
  private physicsDriver: PhysicsDriver;
  private UiService: UIService;
  private scoreboard: Scoreboard = Scoreboard.instance;
  private effectObjects: EffectObject[] = [];
  // private timedEffectDriver: TimedEffectDriver = new TimedEffectDriver();
  private playerCar: string;
  private playerColor: string;
  private map: string;
  static instance: GameScene;

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
    console.log(this.map);
    this.track = await TrackLoader.loadTrack(this.displayDriver, `/assets/tracks/${this.map}/track.json`);
    this.startCoundown();

    this.UiService.generateScoreboard();
    this.scoreboard.currentLap = 0;
    this.scoreboard.resetCurrentTime();

    await this.loadPlayer(this.track.startPositions[0]);
    await this.loadOpponents(
      this.track.startPositions.slice(1),
      this.track.checkPointPath!,
      this.displayDriver.scaler
    );
    await this.loadEffectObjects();
    this.initListeners();
  }

  static getInstance(): GameScene {
    if (!GameScene.instance) {
      throw new Error("Game instance not initialized");
    }
    return GameScene.instance;
  }

  startCoundown() {
    Game.getInstance().pauseGame();
    const countdownDialog = document.querySelector("#countdown-scene");
    const countdown = document.querySelector(".countdown");
    const text = document.querySelector(".countdown_text");
    const speedMeter = document.querySelector(".speed-meter__inner");

    if (!countdown || !text || !countdownDialog || !speedMeter) {
      throw Error("Countdown scene not initialized");
    }
    countdown.innerHTML = "3";
    text.innerHTML = "READY";
    countdownDialog.setAttribute("style", "display: block");
    speedMeter.setAttribute("style", "display: none");
    setTimeout(() => {
      countdown.innerHTML = "2";
      text.innerHTML = "STEADY";
      setTimeout(() => {
        countdown.innerHTML = "1";
        text.innerHTML = "GO!";
        setTimeout(() => {
          countdownDialog.setAttribute("style", "display: none");
          speedMeter.setAttribute("style", "display: block");
          Game.getInstance().resumeGame();
        }, 1000);
      }, 1000);
    }, 1000);
  }

  get player(): PlayerController {
    if (!this.playerController) {
      throw new Error("Player not initialized");
    }
    return this.playerController;
  }

  private initListeners() {
    document.addEventListener("keypress", (e) => {
      if (e.key === " ") {
        const obstacle = this.playerController?.dropObstacle();
        if (!obstacle) return;
        this.effectObjects.push(obstacle);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        const game = Game.getInstance();
        if (game.pauseDetails.isPaused) {
          game.resumeGame();
        } else {
          game.pauseGame();
        }
      }
    });
    window.addEventListener("focus", () => {
      const game = Game.getInstance();

      // if windows state is unknown then it means that is has not been focused but BeforeUpdate shouldn't be called
      if (game.pauseDetails.isWindowActive === null) return;

      game.pauseDetails.isWindowActive = true;
      game.resumeGame();
    });

    window.addEventListener("blur", () => {
      const game = Game.getInstance();

      game.pauseDetails.isWindowActive = false;

      game.pauseGame();
    });
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
    // console.log(spriteName);
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

    //* Create Middle driving enemy
    //*
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite,
        startPositions[0],
        new MiddleDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, 20), scaler),
        "Bob"
      )
    );
    //* Create Middle driving enemy
    //* It will later use BalancedDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite,
        startPositions[1],
        new MiddleDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, 10), scaler),
        "Jack"
      )
    );
    //* Create Middle driving enemy
    //* It will later use AggressiveDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite,
        startPositions[2],
        new MiddleDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, -35), scaler),
        "NormcnkZJXnvkxjzcnvknjxcal"
      )
    );
    //* Create Middle driving enemy
    //* It will later use SuperAggressiveDrivingPolicy
    this.opponentControllersList.push(
      new OpponentController(
        opponentSprite,
        startPositions[3],
        new MiddleDrivingPolicy(EnemyPath.createFromTrackPath(checkPointPath, -20), scaler),
        "Middle"
      )
    );
  }

  private async loadEffectObjects() {
    const randomObstacles = getRandomObstacles(3, this.effectObjects);
    this.effectObjects.push(...randomObstacles);

    const addPerk = () => {
      const randomPerks = getRandomPerks(1, this.effectObjects);
      randomPerks.forEach((perk) => {
        const index = this.effectObjects.length;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        perk._onEnter = (car) => {
          // console.log("_onEnter");
          delete this.effectObjects[index];
          addPerk();
        };
        this.effectObjects.push(perk);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_ctx: CanvasRenderingContext2D) {
    if (this.displayDriver === null || this.track === null) {
      return;
    }

    this.displayDriver.displayTrack(this.track);
    this.effectObjects.forEach((obstacle) => {
      this.displayDriver.drawSprite({
        sprite: obstacle.sprite,
        position: obstacle.position,
        currentSprite: 0,
      });
    });
    this.renderPlayer();
    this.opponentControllersList.forEach((opponent) => {
      this.displayDriver.drawSprite(opponent.displayData);
    });

    this.displayDriver.displayTrackFgLayers(this.track);
    this.track.displayCheckpoints(this.displayDriver);
    this.displayDriver.performDrawCalls();
  }

  renderPlayer() {
    if (!this.playerController) {
      return;
    }
    // TODO: add this effect marking also to opponents
    //! DEV: Draw player has boost effect
    if (this.playerController.timedEffectDriver.effects) {
      this.displayDriver.ctx.rect(
        this.playerController.displayData.position.x,
        this.playerController.displayData.position.y,
        10,
        10
      );
      if (this.playerController.timedEffectDriver.hasEffect("boost")) {
        this.displayDriver.ctx.fillStyle = "green";
      } else if (this.playerController.timedEffectDriver.hasEffect("slip")) {
        this.displayDriver.ctx.fillStyle = "yellow";
      } else if (this.playerController.timedEffectDriver.hasEffect("damaged")) {
        this.displayDriver.ctx.fillStyle = "red";
      }
      this.displayDriver.ctx.fill();
    }
    this.displayDriver.drawSprite(this.playerController.displayData);
  }

  private trackUpdate() {
    if (this.track === null) {
      return;
    }
  }

  private playerUpdate(deltaTime: number) {
    if (!this.playerController || !this.playerController.displayData) {
      return;
    }

    this.playerController.update(deltaTime);
    this.physicsDriver.updateController(this.playerController, deltaTime);
  }

  private opponentsUpdate(deltaTime: number) {
    if (this.opponentControllersList.length === 0) {
      return;
    }

    for (const opponent of this.opponentControllersList) {
      opponent.update(deltaTime);
      this.physicsDriver.updateController(opponent, deltaTime);
    }
  }

  private collisionUpdate() {
    this.handleTrackCollisions();
    this.handleControllerCollisions();
  }

  private handleTrackCollisions() {
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

    this.opponentControllersList.forEach((opponent) => {
      const opponentCorners = getCarCorners(
        opponent.displayData.position,
        opponent.colliderHeight,
        opponent.colliderWidth,
        opponent.angle
      );

      if (this.collisionManager.isCollidingWithTrack(opponentCorners, trackCollider) !== null) {
        this.physicsDriver.handleCollision(
          opponent,
          this.collisionManager.isCollidingWithTrack(opponentCorners, trackCollider)!,
          trackCollider
        );
      }
    });
  }

  private handleControllerCollisions() {
    if (!this.playerController) {
      return;
    }

    //* Take note that if we check all collisions of the opponents we dont need to bother with player collisions
    for (const opponent of this.opponentControllersList) {
      //* Handle player enemy collisions
      if (
        this.collisionManager.isCollidingWithAnotherObject(
          this.playerController.collision,
          opponent.collision
        )
      ) {
        this.physicsDriver.handleCollisionBetweenControllers(this.playerController, opponent);
      }

      //* Handle enemy enemy collisions
      this.opponentControllersList.forEach((opponent2) => {
        if (opponent === opponent2) {
          return;
        }
        if (this.collisionManager.isCollidingWithAnotherObject(opponent.collision, opponent2.collision)) {
          this.physicsDriver.handleCollisionBetweenControllers(opponent, opponent2);
        }
      });
    }
  }

  private effectUpdate() {
    if (!this.playerController) {
      return;
    }

    this.effectObjects.forEach((obstacle) => {
      const playerCorners = getCarCorners(
        this.playerController!.displayData.position,
        this.playerController!.colliderHeight,
        this.playerController!.colliderWidth,
        this.playerController!.angle
      );

      const collidingCars: PhysicsBasedController[] = [];

      const isPlayerColliding = this.collisionManager.isCollidingWithAnotherObject(
        playerCorners,
        obstacle.collision
      );

      if (isPlayerColliding) {
        collidingCars.push(this.playerController!);
      }

      this.opponentControllersList.forEach((opponent) => {
        const opponentCorners = getCarCorners(
          opponent.displayData.position,
          opponent.colliderHeight,
          opponent.colliderWidth,
          opponent.angle
        );

        if (this.collisionManager.isCollidingWithAnotherObject(opponentCorners, obstacle.collision)) {
          collidingCars.push(opponent);
        }
      });
      obstacle._update(collidingCars);
    });

    this.playerController.timedEffectDriver.update();
    this.opponentControllersList.forEach((opponent) => opponent.timedEffectDriver.update());
  }

  private uiUpdate() {
    if (!this.playerController) {
      return;
    }

    const t =
      (Vector.length(this.playerController.actualForce) / this.playerController.currentMaxSpeedForward) * 270;
    this.UiService.setSpeedMeterValue(t);

    this.UiService.setAccMeterValue(Math.min(t, 240) + 30);

    // console.log(this.playerController.obstacleDropLoadFraction);
    // draw obstacle drop loading
    this.displayDriver.drawFillingCircle(
      { x: (this.displayDriver.normalizedDisplayWidth / 2) * this.displayDriver.scaler, y: 20 },
      16,
      "red",
      "yellowgreen",
      this.playerController.obstacleDropLoadFraction
    );
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
      const nickname = Game.instance.nickname;
      console.log("koniec");
      Scoreboard.instance.playerResults.push({ nickname: nickname, time: this.scoreboard.currentTime });
      this.playerController.finished = true;
      this.playerController.finishedTime = this.scoreboard.currentTime;
      //  ((this.scoreboard.currentTime % 60000) / 1000).toFixed(2);

      if (
        this.playerController.finished &&
        this.opponentControllersList.every((opponent) => opponent.finished)
      ) {
        Game.instance.startResultScene();
      }
      // Game.instance.startResultScene();
    }
  }
}

export default GameScene;
