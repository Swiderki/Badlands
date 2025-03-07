import DisplayDriver from "./display-driver/display-driver";
import GameScene from "../scenes/GameScene";
import MainMenuScene from "../scenes/MainMenuScene";
import Scene from "../scenes/Scene";
import { StartScene } from "../scenes/StartScene";

class Game {
  //* Drivers
  displayDriver: DisplayDriver;

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;

  private _currentScene: Scene | null = null;

  static instance: Game;

  deltaTime: number = 0;

  get currentScene() {
    if (!this._currentScene) {
      throw new Error("Current scene not initialized");
    }
    return this._currentScene;
  }

  set currentScene(scene: Scene) {
    if (this._currentScene) this._currentScene.onDisMount();
    this._currentScene = scene;

    this._currentScene.onMount();
  }

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);
    this.currentScene = new StartScene();
    this.currentScene.init();
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  static getInstance(): Game {
    if (!Game.instance) {
      throw new Error("Game instance not initialized");
    }
    return Game.instance;
  }

  async start() {
    this.displayDriver.setResolution(320, 182);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();
    await this.startGameScene();

    //* Start the game loop
    this._update();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (this.currentScene instanceof MainMenuScene) {
        this.startGameScene();
      } else {
        this.startMainMenuScene();
      }
    }
  }

  async startGameScene() {
    this.currentScene = new GameScene(this.displayDriver);
    await this.currentScene.init();
  }

  private startMainMenuScene() {
    this.currentScene = new MainMenuScene();
    this.currentScene.init();
  }

  //* This method is called every frame, but it should be free of any game logic
  //* It's only purpose is to keep FPS stable
  //* It prevents the game from running too fast or too slow
  //! For any game logic check out the update method
  private _update() {
    this.displayDriver.clear();
    this.deltaTime = (this._lastRenderTime - this._penultimateRenderTime) / 1000;

    this.currentScene.update(this.deltaTime);
    this.currentScene.render(this.displayDriver.ctx);

    requestAnimationFrame((renderTime) => {
      this._penultimateRenderTime = this._lastRenderTime;
      this._lastRenderTime = renderTime;
      this._update();
    });
  }
}

export default Game;
