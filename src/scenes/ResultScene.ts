import Scene from "./Scene";
import Game from "@/src/services/game";

export class ResultScene extends Scene {
  private sceneRef: HTMLElement | null = null;
  private playerResults: string[] | null = null;
  constructor() {
    super();
  }

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#result-scene");
    if (!this.sceneRef) {
      throw Error("Start scene not initialized");
    }
    this.sceneRef.style.display = "block";

    const playerResults = localStorage.getItem("playerResults");
    if (!playerResults) this.playerResults = [];
    else this.playerResults = JSON.parse(playerResults);
    this.overwritePlayerResults();

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
    this.sceneRef = document.querySelector("#result-scene");
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

  overwritePlayerResults() {
    const playerResultsList = this.sceneRef?.querySelector(".player-results");
    if (!playerResultsList) return;

    playerResultsList.innerHTML = "";

    if (this.playerResults) {
      const topResults = this.playerResults
        .map((result) => parseInt(result))
        .sort((a, b) => a - b)
        .slice(0, 3);

      topResults.forEach((result, index) => {
        const resultHTML = document.createElement("li");
        const seconds = ((result % 60000) / 1000).toFixed(2);
        resultHTML.innerText = `${index + 1}: ${seconds}s`;
        playerResultsList.appendChild(resultHTML);
      });
    }
  }
}
