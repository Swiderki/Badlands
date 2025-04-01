import Scene from "./_scene";
import Game from "@/src/services/game";
import assert from "../util/assert";

export class AboutScene extends Scene {
  private sceneRef: HTMLElement | null = null;

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#about-scene");
    assert(this.sceneRef, "About scene not initialized");
    this.sceneRef.style.display = "block";

    const backBtnRef = this.sceneRef.querySelector("button:first-of-type");
    this.addRemovableListener(backBtnRef, "click", () => {
      if (!Game.getInstance()) return;
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
    super.onDisMount();
    assert(this.sceneRef, "About scene not initialized");
    this.sceneRef.style.display = "none";
  }
}
