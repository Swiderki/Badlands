import Scene from "./Scene";
import Game from "@/src/services/game";

export class StartScene extends Scene {
  private sceneRef: HTMLElement | null = null;

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#start-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";

    const playBtnRef = this.sceneRef.querySelector("button:first-of-type");
    playBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      // Game.getInstance().startGameScene();
      Game.getInstance().startSelectionScene();
    });
  }

  override update(deltaTime: number): void {}

  override render(ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#start-scene");
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
