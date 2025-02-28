import { DisplayData, SpriteData } from "@/types/display-driver";
import { SpriteLoader } from "./sprite-loader";
import Track from "../track-driver/track-driver";
import { Vec2D } from "@/types/physics";
import { CheckPoint } from "@/types/track-driver";

class DisplayDriver {
  private static _instance: DisplayDriver;

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private spriteLoader: SpriteLoader;

  //* I should load this from config or set it dynamicly but it will be fixed 'cause im to lazy to bother
  //* if this one causes u problems fixinf is up to u :*
  scaler: number = 3;

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

  static get currentInstance(): DisplayDriver | null {
    if (!DisplayDriver._instance) {
      return null;
    }
    return DisplayDriver._instance;
  }

  setResolution(width: number, height: number) {
    this._canvas.width = width * this.scaler;
    this._canvas.height = height * this.scaler;
  }

  get normalizedDisplayWidth() {
    return this._canvas.width / this.scaler;
  }

  get normalizedDisplayHeight() {
    return this._canvas.height / this.scaler;
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
    //* Disable image antialiasing(blurriness)
    this._ctx.imageSmoothingEnabled = false;
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

  displayTrack(track: Track) {
    for (const layer of track.layers) {
      if (!layer) {
        continue;
      }
      //* Here we use direct draw 'cause this happens every frame and nedd to be as quick as possible
      //* Since that's the case allocating usless SpriteData object would be a waste of resources(memory & compute power)
      this._ctx.drawImage(
        layer.image,
        0,
        0,
        layer.config.spriteWidth * this.scaler,
        layer.config.spriteHeight * this.scaler
      );
    }
  }

  displayColliderCorners(corners: Vec2D[], position: Vec2D, angle: number) {
    this._ctx.lineWidth = 3;
    this._ctx.strokeStyle = "red";
    this._ctx.beginPath();
    this._ctx.moveTo(corners[0].x, corners[0].y);
    this._ctx.lineTo(corners[1].x, corners[1].y);
    this._ctx.lineTo(corners[3].x, corners[3].y);
    this._ctx.lineTo(corners[2].x, corners[2].y);
    this._ctx.lineTo(corners[0].x, corners[0].y);
    this._ctx.stroke();
    this._ctx.closePath();
  }

  displayCollisionEffect() {
    this._ctx.lineWidth = 10;
    this._ctx.strokeStyle = "red";
    this._ctx.beginPath();
    this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
    this._ctx.stroke();
    this._ctx.closePath();
  }

  displayCheckpoints(checkpoints: CheckPoint[]) {
    for (const point of checkpoints) {
      this._ctx.fillStyle = "yellow";
      this._ctx.beginPath();
      this._ctx.fillRect(point.point.x * this.scaler, point.point.y * this.scaler, 2, 2);
      this._ctx.fill();
      this._ctx.closePath();
    }
  }

  drawForceVector(position: Vec2D, force: Vec2D, color: string = "green") {
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = 2;
    this._ctx.beginPath();
    this._ctx.moveTo(position.x, position.y);
    this._ctx.lineTo(position.x + force.x, position.y + force.y);
    this._ctx.stroke();
    this._ctx.closePath();
  }
}

export default DisplayDriver;
