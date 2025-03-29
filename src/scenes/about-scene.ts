import Scene from "./_scene";
import Game from "@/src/services/game";
import assert from "../util/assert";

export class AboutScene extends Scene {
  private sceneRef: HTMLElement | null = null;

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#about-scene");
    assert(this.sceneRef, "About scene not initialized");
    this.sceneRef.style.display = "block";

    const playBtnRef = this.sceneRef.querySelector("button:first-of-type");
    playBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      // Game.getInstance().startGameScene();
      Game.getInstance().startStartScene();
    });
  }

  override update(): void {}

  override render(): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#about-scene");
    assert(this.sceneRef, "About scene not initialized");
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    assert(this.sceneRef, "About scene not initialized");
    this.sceneRef.style.display = "none";
  }
}
