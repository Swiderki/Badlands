import Scene from "./Scene";

class MainMenuScene extends Scene {
  constructor() {
    super();
  }

  init() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_deltaTime: number) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Main Menu", 100, 100);
  }

  override onMount() {}
  override onDisMount() {}
}

export default MainMenuScene;
