import { Scoreboard } from "../services/scoreboard/scoreboard";
import GameScene from "./game-scene";
import Scene from "./_scene";
import Game from "@/src/services/game";
import assert from "../util/assert";

export class ResultScene extends Scene {
  private sceneRef: HTMLElement | null = null;
  private results: { nickname: string; time: number, bestLoopTime: number }[] = [];
  constructor() {
    super();
  }

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector("#result-scene");
    assert(this.sceneRef, "Result scene not initialized");
    this.sceneRef.style.display = "block";
    this.overwritePlayerResults();
    this.overWriteRaceResults();
    this.addAnimation();

    const playBtnRef = this.sceneRef.querySelector("button:first-of-type");
    playBtnRef?.addEventListener("click", () => {
      if (!Game.getInstance()) return;
      // Game.getInstance().startGameScene();
      Game.getInstance().startSelectionScene();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(deltaTime: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render(ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector("#result-scene");
    assert(this.sceneRef, "Result scene not initialized");
    this.sceneRef.style.display = "block";
  }

  override onDisMount() {
    assert(this.sceneRef, "Result scene not initialized");
    this.sceneRef.style.display = "none";
  }

  overwritePlayerResults() {
    const playerResultsList = this.sceneRef?.querySelector(".player-results");
    if (!playerResultsList) return;

    playerResultsList.innerHTML = "";
    const playerResults = Scoreboard.instance.playerResults;

    if (playerResults && Array.isArray(playerResults)) {
      const results = playerResults.map((result) =>
        typeof result === "string" ? JSON.parse(result) : result
      );

      const topResults = results.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      topResults.forEach((result, index) => {
        const resultHTML = document.createElement("li");

        const seconds = ((parseFloat(result.time) % 60000) / 1000).toFixed(2);
        const minutes = Math.floor(result.time / 60000);
        let minutesString = minutes.toString();
        if (minutes < 10) {
          minutesString = "0" + minutes;
        }
        let secondsString = seconds.toString();
        if (Number(seconds) < 10) {
          secondsString = "0" + seconds;
        }

        resultHTML.innerText = `${index + 1}: ${result.nickname} - ${minutesString}:${secondsString}`;
        playerResultsList.appendChild(resultHTML);
      });
    }
  }
  overWriteRaceResults() {
    this.results = [];

    const opponentsResults =
      GameScene.instance?.opponentControllersList.map((opponent) => ({
        nickname: opponent.nickname,
        time: opponent.finishedTime,
        bestLoopTime: opponent.bestLoopTime,
      })) || [];

    const playerResults = {
      nickname: Game.instance.nickname,
      time: GameScene.instance.playerController!.finishedTime,
      bestLoopTime: GameScene.instance.playerController!.bestLoopTime,
    };

    this.results = [...opponentsResults, playerResults];
    console.log(this.results);
    // Sortowanie - najpierw normalnie po czasie, a DNF (time === 0) na końcu
    this.results.sort((a, b) => {
      if (a.time === 0) return 1;
      if (b.time === 0) return -1;
      return a.time - b.time;
    });

    const raceResults = document.querySelector(".race-results ul");
    if (!raceResults) return;
    raceResults.innerHTML = "";

    this.results.forEach((result, index) => {
      const resultHTML = document.createElement("li");
      resultHTML.innerText =
        result.time === 0
          ? `${index + 1}: ${result.nickname} - DNF`
          : `${index + 1}: ${result.nickname} - ${this.formatTime(result.time)}`;
      raceResults.appendChild(resultHTML);
    });
    this.displayWinner();
  }
  displayWinner() {
    if (!this.results.length || this.results[0].time === 0) return;
    const winner = this.results[0];
    document.querySelector(".winner_nickname")!.innerHTML = winner.nickname;
    document.querySelector(".winner_time")!.innerHTML = "Time: " + this.formatTime(winner.time) + " Best lap: " + this.formatTime(winner.bestLoopTime);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = ((time % 60000) / 1000).toFixed(2).padStart(5, "0");
    return `${minutes}:${seconds}`;
  }

  addAnimation() {
    const raceResults = document.querySelector(".race-results ul") as HTMLElement | null;
    if (!raceResults) return;

    const items = Array.from(raceResults.children) as HTMLElement[];

    const totalWidth = items.reduce((sum, item) => sum + item.offsetWidth, 0);

    raceResults.style.width = `${totalWidth}px`;

    const duration = totalWidth * 0.02;

    raceResults.style.animation = `scrollAnimation ${duration}s linear infinite alternate`;

    const playerResults = document.querySelector(".player-results") as HTMLElement | null;
    if (!playerResults) return;

    const playerItems = Array.from(playerResults.children) as HTMLElement[];

    const playerTotalWidth = playerItems.reduce((sum, item) => sum + item.offsetWidth, 0);

    playerResults.style.width = `${playerTotalWidth}px`;

    const playerDuration = playerTotalWidth * 0.02;
    if (playerTotalWidth < 300) return;
    playerResults.style.animation = `scrollAnimation ${playerDuration}s linear infinite alternate`;
  }
}
