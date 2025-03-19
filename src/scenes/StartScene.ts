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

    const playBtnRef = this.sceneRef.querySelector("button:nth-of-type(2)");
    playBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      // Game.getInstance().startGameScene();
      dialog?.setAttribute("style", "display: grid;");

      // Game.getInstance().startSelectionScene();
    });
    const aboutBtnRef = this.sceneRef.querySelector("button:first-of-type");
    const dialog = this.sceneRef.querySelector(".dialog");
    aboutBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      // Game.getInstance().startGameScene();

      Game.getInstance().startAboutScene();
    });
    const closeBtnRef = this.sceneRef.querySelector(".dialog button:first-of-type");
    closeBtnRef?.addEventListener("click", () => {
      dialog?.setAttribute("style", "display: none;");
      // Game.getInstance().startAboutScene();
    });

    const startGameBtnRef = this.sceneRef.querySelector(".dialog button:last-of-type");
    startGameBtnRef?.addEventListener("click", () => {
      const inputRef = this.sceneRef?.querySelector("input");
      if (!inputRef) return;
      if (!Game.getInstance()) return;

      const nickname = inputRef.value;
      if (nickname === "") return;

      Game.getInstance().nickname = nickname;

      dialog?.setAttribute("style", "display: none;");
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
