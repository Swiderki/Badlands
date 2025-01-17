import Game from "./services/game";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("app") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Failed to get app element");
  }

  const game = new Game(canvas);
  game.start();
});
