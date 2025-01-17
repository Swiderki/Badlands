import DisplayDriver from "./display-driver/display-driver";

class Game {
  displayDriver: DisplayDriver;

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);
  }

  async start() {
    this.displayDriver.setResolution(800, 600);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();

    const sprite = this.displayDriver.getSprite("red_vehicle");
    if (!sprite) {
      throw new Error("Failed to get sprite");
    }

    this.displayDriver.drawSprite(sprite, { x: 20, y: 20 }, 0);
  }
}

export default Game;
