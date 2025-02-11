import PlayerController from "./controllers/player-controller";
import DisplayDriver from "./display-driver/display-driver";
import PhysicsDriver from "./physics-driver/physics-driver";

class Game {
  //* Drivers
  displayDriver: DisplayDriver;
  physicsDriver: PhysicsDriver;

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;

  private playerController: PlayerController | null = null; //* In the there will be Player Controller class

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);
    this.physicsDriver = new PhysicsDriver();
  }

  async start() {
    this.displayDriver.setResolution(800, 600);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();

    //* In the future there will be separate function to do all the loading, as for now it's here
    const playerSprite = this.displayDriver.getSprite("red_vehicle");
    if (!playerSprite) {
      throw new Error("Failed to get sprite");
    }

    this.playerController = new PlayerController(playerSprite);

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
    this.playerUpdate(deltaTime);
  }

  private playerUpdate(deltaTime: number) {
    if (!this.playerController || !this.playerController.displayData) {
      return;
    }

    this.playerController.update(deltaTime);
    this.physicsDriver.updateController(this.playerController, deltaTime);
    this.displayDriver.drawSprite(this.playerController.displayData);
  }
}

export default Game;
