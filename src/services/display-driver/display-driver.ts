import { DisplayData, SpriteData } from "@/types/display-driver";
import { SpriteLoader } from "./sprite-loader";

class DisplayDriver {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private spriteLoader: SpriteLoader;

  constructor(canvas: HTMLCanvasElement) {
    //* Initialize the sprite loader
    this.spriteLoader = new SpriteLoader();

    //* Set the canvas and context
    this._canvas = canvas;
    const ctx = this._canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2d context");
    }

    this._ctx = ctx;
  }

  setResolution(width: number, height: number) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  //* Load all sprites from autoload file
  async autoLoadSprites() {
    return fetch(location.origin + "/assets/autoload.json")
      .then((response) => response.json())
      .then((spriteData: SpriteData[]) => {
        return Promise.all(
          spriteData.map((sprite) => this.spriteLoader.loadSprite(sprite.name, sprite.src, sprite.config))
        );
      })
      .catch((err) => {
        throw new Error(`Failed to load sprites: ${err}`);
      });
  }

  getSprite(name: string) {
    return this.spriteLoader.getSprite(name);
  }

  clear(color: string = "black") {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawSprite({ sprite, position, currentSprite }: DisplayData) {
    const currentSpriteX = currentSprite * sprite.config.spriteWidth;
    this._ctx.drawImage(
      sprite.image,
      currentSpriteX,
      0, //* As for now we assume that the sprite sheet is horizontal
      sprite.config.spriteWidth,
      sprite.config.spriteHeight,
      position.x,
      position.y,
      sprite.config.spriteWidth,
      sprite.config.spriteHeight
    );
  }
}

export default DisplayDriver;
