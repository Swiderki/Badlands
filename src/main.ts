import Game from "./services/game";

function resizeApp(app: HTMLDivElement) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scalingFactor = Math.min(width / (320 * 4), height / (182 * 4));
  console.log(scalingFactor);
  app.style.scale = `${scalingFactor.toPrecision(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Failed to get app element");
  }

  const app = document.getElementById("app") as HTMLDivElement;
  if (!app) {
    throw new Error("Failed to get app element");
  }

  resizeApp(app);
  window.addEventListener("resize", () => {
    resizeApp(app);
  });
  const game = new Game(canvas);
  game.start();
});
