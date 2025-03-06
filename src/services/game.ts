import DisplayDriver from "./display-driver/display-driver";
import GameScene from "../scenes/GameScene";
import MainMenuScene from "../scenes/MainMenuScene";
import Scene from "../scenes/Scene";
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

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;
  
  private currentScene: Scene;


  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);
    this.currentScene = new MainMenuScene();
    this.currentScene.init();

    window.addEventListener("keydown", this.handleKeyDown.bind(this));
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

  private async startGameScene() {
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
    const deltaTime = (this._lastRenderTime - this._penultimateRenderTime) / 1000;

    this.currentScene.update(deltaTime);
    this.currentScene.render(this.displayDriver.ctx);

    requestAnimationFrame((renderTime) => {
      this._penultimateRenderTime = this._lastRenderTime;
      this._lastRenderTime = renderTime;
      this._update();
    });
  }
}

export default Game;
