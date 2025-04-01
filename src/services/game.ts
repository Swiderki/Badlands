import { htmlHideLoadingScreen, htmlHidePauseOverlay, htmlShowPauseOverlay } from "../util/html-utils";

import { AboutScene } from "../scenes/about-scene";
import DisplayDriver from "./display-driver/display-driver";
import GameScene from "../scenes/game-scene";
import GameTimeline from "./game-logic/game-timeline";
import MainMenuScene from "../scenes/main-menu-scene";
import { ResultScene } from "../scenes/result-scene";
import Scene from "../scenes/_scene";
import { Scoreboard } from "./scoreboard/scoreboard";
import { SelectionScene } from "../scenes/selection-scene";
import { StartScene } from "../scenes/start-scene";
import assert from "../util/assert";
import { startMusicWithFade } from "../util/music-utils";
import { createPauseContext } from "../context/pauseContext";

class Game {
  //* Drivers
  displayDriver: DisplayDriver;

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;
  private _currentScene: Scene | null = null;
  private _nickname: string = "";
  private _fps: number = 0;

  static instance: Game;

  deltaTime: number = 0;

  private _pauseDetails = createPauseContext({
    isPaused: false,
    isWindowActive: null,
    documentTimeline: new DocumentTimeline(),
    pauseGame: this.pauseGame,
    resumeGame: this.resumeGame,
  });

  private menuMusic: HTMLAudioElement = new Audio("/assets/sounds/menu_theme.wav");

  get currentScene() {
    assert(this._currentScene, "Current scene not initialized");
    return this._currentScene;
  }

  set currentScene(scene: Scene) {
    if (this._currentScene) this._currentScene.onDisMount();
    this._currentScene = scene;
    this._currentScene.onMount();

    if (
      scene instanceof AboutScene ||
      scene instanceof MainMenuScene ||
      scene instanceof SelectionScene ||
      scene instanceof StartScene
    ) {
      this.menuMusic.loop = true;
      startMusicWithFade(this.menuMusic);
    } else {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(nickname: string) {
    this._nickname = nickname;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);

    Game.instance = this;
  }

  static getInstance(): Game {
    assert(Game.instance, "Game instance not initialized");
    return Game.instance;
  }

  async start() {
    this.displayDriver.setResolution(320, 182);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();
    htmlHideLoadingScreen();

    this.startStartScene();
    window.addEventListener("keydown", this.handleKeyDown.bind(this));

    //* Start the game loop
    this._update();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === "p") {
      this.startResultScene();

      if (this.currentScene instanceof MainMenuScene) {
        // this.startGameScene();
        // this.currentScene = this.
      } else if (this.currentScene instanceof GameScene) {
        // this.startMainMenuScene();
      }
    }

    if (event.key === "o") {
      this.nickname = "Player";
      this.startGameScene("peugeot", "pink", "grass");
    }
    if (event.key === "i") {
      Scoreboard.instance.currentLap += 1;
      const gameScene = Game.instance.currentScene;
      if (gameScene instanceof GameScene) {
        gameScene.opponentControllersList.forEach((opponent) => {

          opponent.currentLap += 1;
        });
      }
    }
  }

  async startGameScene(car: string, color: string, map: string) {
    this.currentScene = new GameScene(this.displayDriver, car, color, map);
    await this.currentScene.init();
  }

  async startSelectionScene() {
    this.currentScene = new SelectionScene();
    await this.currentScene.init();
  }

  private startMainMenuScene() {
    this.currentScene = new MainMenuScene();
    this.currentScene.init();
  }

  startResultScene() {
    this.currentScene = new ResultScene();
    this.currentScene.init();
  }

  async startAboutScene() {
    this.currentScene = new AboutScene();
    this.currentScene.init();
  }

  async startStartScene() {
    this.currentScene = new StartScene();
    this.currentScene.init();
  }

  pauseGame(skipOverlayUpdate = false): void {
    if (!skipOverlayUpdate && this.currentScene instanceof GameScene) {
      htmlShowPauseOverlay();
    }
    this._pauseDetails.isPaused = true;
  }

  resumeGame(): void {
    htmlHidePauseOverlay();
    this._pauseDetails.isPaused = false;
    this._lastRenderTime = this._pauseDetails.documentTimeline.currentTime as number;
    this._penultimateRenderTime = this._pauseDetails.documentTimeline.currentTime as number;
    this._update();
  }
  //* This method is called every frame, but it should be free of any game logic
  //* It's only purpose is to keep FPS stable
  //* It prevents the game from running too fast or too slow
  //! For any game logic check out the update method
  private _update() {
    this.displayDriver.clear();
    this.deltaTime = (this._lastRenderTime - this._penultimateRenderTime) / 1000;

    // Calculate FPS
    if (this.deltaTime > 0) {
      this._fps = Math.round(1 / this.deltaTime);
    }

    GameTimeline.update(this.deltaTime);
    this.currentScene.update(this.deltaTime);
    this.currentScene.render(this.displayDriver.ctx);

    // Render FPS counter
    this.displayDriver.ctx.fillStyle = "white";
    this.displayDriver.ctx.font = "12px Arial";
    this.displayDriver.ctx.fillText(`FPS: ${this._fps}`, 10, 20);

    // pause render if window isn't active
    // returns here to allow last render before pause
    if (this._pauseDetails.isPaused === true) return;

    requestAnimationFrame((renderTime) => {
      this._penultimateRenderTime = this._lastRenderTime;
      this._lastRenderTime = renderTime;
      this._update();
    });
  }
}

export default Game;
