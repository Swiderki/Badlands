abstract class Scene {
  abstract init(): void | Promise<void>;
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

export default Scene;
