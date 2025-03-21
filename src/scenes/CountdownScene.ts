import Scene from "./Scene";
import Game from "@/src/services/game";

export class CountdownScene extends Scene {
  private sceneRef: HTMLElement | null = null;
  private selectedMap: string = "grass";
  private selectedCar: string = "peugeot";
  private selectedColor: string = "pink";

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#countdown-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";
    const countdown = this.sceneRef.querySelector(".countdown");
    const text = this.sceneRef.querySelector(".countdown_text");
    if (!countdown || !text) {
      throw Error("Countdown scene not initialized");
    }
    countdown.innerHTML = "3";
    text.innerHTML = "READY";
    setTimeout(() => {
      countdown.innerHTML = "2";
      text.innerHTML = "STEADY";
      setTimeout(() => {
        countdown.innerHTML = "1";
        text.innerHTML = "GO!";
        setTimeout(() => {
          if (!Game.getInstance()) return;
          Game.getInstance().startGameScene(this.selectedCar, this.selectedColor, this.selectedMap);
        }, 1000);
      }, 1000);
    }, 1000);
  }

  constructor(car: string, color: string, map: string) {
    super();
    this.selectedCar = car;
    this.selectedColor = color;
    this.selectedMap = map;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(deltaTime: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render(ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#countdown-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "none";
  }
}
