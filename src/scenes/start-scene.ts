import Scene from "./_scene";
import Game from "@/src/services/game";
import assert from "../util/assert";

export class StartScene extends Scene {
  private sceneRef: HTMLElement | null = null;

  override init(): void | Promise<void> {
    assert(this.sceneRef, "Start scene not initialized");
    this.sceneRef.style.display = "block";

    const playBtnRef = this.sceneRef.querySelector("button:nth-of-type(2)");
    this.addRemovableListener(playBtnRef, "click", () => {
      if (!Game.getInstance()) return;
      dialog?.setAttribute("style", "display: grid;");
    });

    const aboutBtnRef = this.sceneRef.querySelector("button:first-of-type");
    const dialog = this.sceneRef.querySelector(".dialog.nickname");
    this.addRemovableListener(aboutBtnRef, "click", () => {
      if (!Game.getInstance()) return;
      Game.getInstance().startAboutScene();
    });

    const closeBtnRef = this.sceneRef.querySelector(".dialog.nickname button:first-of-type");
    this.addRemovableListener(closeBtnRef, "click", () => {
      dialog?.setAttribute("style", "display: none;");
    });

    const startGameBtnRef = this.sceneRef.querySelector(".dialog.nickname button:last-of-type");
    this.addRemovableListener(startGameBtnRef, "click", () => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(deltaTime: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render(ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#start-scene");
    assert(this.sceneRef, "Start scene not initialized");
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    super.onDisMount();
    assert(this.sceneRef, "Start scene not initialized");
    this.sceneRef.style.display = "none";
  }
}
