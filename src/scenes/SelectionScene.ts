import Scene from "./Scene";
import Game from "@/src/services/game";
import assert from "../util/assert";

export class SelectionScene extends Scene {
  private sceneRef: HTMLElement | null = null;
  private selectedMap: string = "grass";
  private selectedCar: string = "peugeot";
  private selectedColor: string = "pink";

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#selection-scene");
    assert(this.sceneRef, "Selection scene not initialized");
    this.sceneRef.style.display = "block";

    this.sceneRef.querySelectorAll(".options div").forEach((el) => {
      el.addEventListener("click", (event) => {
        const target = event.currentTarget as HTMLElement;

        if (target.hasAttribute("data-map")) {
          this.sceneRef?.querySelectorAll("[data-map]").forEach((e) => e.classList.remove("selected"));
          target.classList.add("selected");

          this.selectedMap = target.getAttribute("data-map") || this.selectedMap;
        }

        if (target.hasAttribute("data-car")) {
          this.sceneRef?.querySelectorAll("[data-car]").forEach((e) => e.classList.remove("selected"));
          target.classList.add("selected");
          this.selectedCar = target.getAttribute("data-car") || this.selectedCar;
        }

        if (target.hasAttribute("data-color")) {
          this.sceneRef?.querySelectorAll("[data-color]").forEach((e) => e.classList.remove("selected"));
          target.classList.add("selected");
          this.selectedColor = target.getAttribute("data-color") || this.selectedColor;
        }
      });
    });

    const playBtnRef = this.sceneRef.querySelector("button#play-btn");
    playBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      Game.getInstance().startGameScene(this.selectedCar, this.selectedColor, this.selectedMap);
    });
    const backBtnRef = this.sceneRef.querySelector("button#back-btn");
    backBtnRef?.addEventListener("click", () => {
      Game.getInstance()?.startStartScene();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(deltaTime: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render(ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#selection-scene");
    assert(this.sceneRef, "Selection scene not initialized");
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    assert(this.sceneRef, "Selection scene not initialized");
    this.sceneRef.style.display = "none";
  }
}
