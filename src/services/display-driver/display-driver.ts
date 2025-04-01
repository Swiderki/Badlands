import { DisplayData, DrawCall, SpriteData, TracePoint } from "@/types/display-driver";

import { CheckPoint } from "@/types/track-driver";
import GameTimeline from "../game-logic/game-timeline";
import PhysicsBasedController from "@/src/controllers/physics-based-controller";
import { SpriteLoader } from "./sprite-loader";
import Track from "../track-driver/track-driver";
import { Vec2D } from "@/types/physics";
import assert from "@/src/util/assert";

class DisplayDriver {
  private static _instance: DisplayDriver;

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private spriteLoader: SpriteLoader;

  private topQueue: DrawCall[] = [];
  //* I should load this from config or set it dynamic but it will be fixed 'cause im to lazy to bother
  //* if this one causes u problems fixing is up to u :*
  scaler: number = 3;

  constructor(canvas: HTMLCanvasElement) {
    //* Initialize the sprite loader
    this.spriteLoader = new SpriteLoader();

    //* Set the canvas and context
    this._canvas = canvas;
    const ctx = this._canvas.getContext("2d");
    assert(ctx, "Failed to get 2d context");

    this._ctx = ctx;

    DisplayDriver._instance = this;
  }

  static get currentInstance(): DisplayDriver | null {
    if (!DisplayDriver._instance) {
      return null;
    }
    return DisplayDriver._instance;
  }

  get ctx() {
    return this._ctx;
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
    for (const layer of track.bgLayers) {
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

  displayTrackFgLayers(track: Track) {
    for (const layer of track.fgLayers) {
      if (!layer) {
        continue;
      }
      this._ctx.drawImage(
        layer.image,
        0,
        0,
        layer.config.spriteWidth * this.scaler,
        layer.config.spriteHeight * this.scaler
      );
    }
  }

  displayColliderCorners(corners: Vec2D[], position: Vec2D, _angle: number) {
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

    // Display the center of the car and the direction
    this._ctx.fillStyle = "blue";
    this._ctx.beginPath();
    this._ctx.arc(position.x, position.y, 2, 0, 2 * Math.PI);
    this._ctx.fill();
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

  displayCheckpoints(checkpoints: CheckPoint[], color?: string) {
    for (const point of checkpoints) {
      this.drawPoint(point.point, 2, color || "yellow");
    }
  }

  drawForceVector(position: Vec2D, force: Vec2D, color: string = "green") {
    this.topQueue.push(() => {
      this._ctx.strokeStyle = color;
      this._ctx.lineWidth = 2;
      this._ctx.beginPath();
      this._ctx.moveTo(position.x, position.y);
      this._ctx.lineTo(position.x + force.x, position.y + force.y);
      this._ctx.stroke();
      this._ctx.closePath();
    });
  }

  drawLineBetweenVectors(vec1: Vec2D, vec2: Vec2D, color: string = "green") {
    this.topQueue.push(() => {
      this._ctx.strokeStyle = color;
      this._ctx.lineWidth = 2;
      this._ctx.beginPath();
      this._ctx.moveTo(vec1.x, vec1.y);
      this._ctx.lineTo(vec2.x, vec2.y);
      this._ctx.stroke();
      this._ctx.closePath();
    });
  }

  drawPoint(point: Vec2D, size: number, color: string) {
    this.topQueue.push(() => {
      this._ctx.fillStyle = color;
      this._ctx.beginPath();
      this._ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
      this._ctx.fill();
      this._ctx.closePath();
    });
  }

  /** @param fillFraction value should be between 0 and 1 */
  drawFillingCircle(
    point: Vec2D,
    size: number,
    fillingColor: string,
    filledColor: string,
    fillFraction: number
  ) {
    this.topQueue.push(() => {
      this._ctx.fillStyle = fillFraction === 1 ? filledColor : fillingColor;
      this._ctx.beginPath();
      this._ctx.arc(
        point.x,
        point.y,
        size,
        Math.PI / 2 - Math.PI * fillFraction,
        Math.PI / 2 + Math.PI * fillFraction
      );
      this._ctx.fill();
      this._ctx.closePath();
    });
  }

  displayActualPath(actualPath: CheckPoint[], color: string) {
    for (let i = 0; i < actualPath.length - 1; i++) {
      this.drawLineBetweenVectors(actualPath[i].point, actualPath[i + 1].point, color);
    }
  }

  performDrawCalls() {
    this.topQueue.forEach((call) => {
      call();
    });
    this.topQueue = [];
  }

  addDrawCall(call: () => void) {
    this.topQueue.push(call);
  }

  private drawPath = (points: TracePoint[], isNitroActive: boolean) => {
    if (points.length > 1) {
      this._ctx.lineWidth = 2;
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const alpha = Math.min(start.alpha || 0, end.alpha || 0); // Use the lower alpha for the segment
        if (alpha > 0) {
          if (isNitroActive) {
            this._ctx.strokeStyle = `rgba(99, 155, 255, ${alpha})`;
          } else {
            this._ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          }
          this._ctx.beginPath();
          this._ctx.moveTo(start.position.x, start.position.y);
          this._ctx.lineTo(end.position.x, end.position.y);
          this._ctx.stroke();
          this._ctx.closePath();
        }
      }
    }
  };

  drawTraces(controller: PhysicsBasedController) {
    this.topQueue.push(() => {
      this.drawPath(controller.tracePoints.left, controller.isNitroActive);
      this.drawPath(controller.tracePoints.right, controller.isNitroActive);
    });
  }

  drawRain() {
    this.topQueue.push(() => {
      const now = GameTimeline.now() / 10;
      const image = this.getSprite("rain")?.image;
      assert(image, "add img with id='rain' in index.html");
      const ptrn = this._ctx.createPattern(image, "repeat")!;
      this._ctx.fillStyle = ptrn;

      // Simulate rain falling at a 30-degree angle
      const verticalOffset = now % (this._canvas.height * 2);
      const angle = Math.PI / 6; // 30 degrees in radians
      const xOffset = verticalOffset * Math.tan(angle);

      this._ctx.save();
      this._ctx.translate(-xOffset, verticalOffset);
      this._ctx.rotate(-angle);
      this._ctx.fillRect(
        -this._canvas.width,
        -this._canvas.height * 2,
        this._canvas.width * 3,
        this._canvas.height * 4
      );
      this._ctx.restore();
    });
  }
}

export default DisplayDriver;
