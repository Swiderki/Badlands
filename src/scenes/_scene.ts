type EventListenerParameters<K extends keyof DocumentEventMap> = Parameters<
  typeof document.addEventListener<K>
>;
type ListenerTarget = Element | Document | Window;
type ListenerDetails = {
  htmlElement: ListenerTarget;
  params: EventListenerParameters<keyof DocumentEventMap>;
};

abstract class Scene {
  private eventListeners: ListenerDetails[] = [];

  abstract init(): void | Promise<void>;
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract onMount(): void;
  onDisMount(): void {
    console.log("remove", this.eventListeners.length, "listeners");
    this.eventListeners.forEach(({ htmlElement, params }) => {
      htmlElement.removeEventListener(...params);
    });
  }

  protected addRemovableListener<K extends keyof DocumentEventMap>(
    htmlElement: ListenerTarget | null,
    ...params: EventListenerParameters<K>
  ) {
    console.log("add event lister for ", htmlElement, "by", this);
    if (!htmlElement) return;
    htmlElement.addEventListener(...(params as [any, any, any]));
    this.eventListeners.push({ htmlElement, params: params as [any, any, any] });
  }
}

export default Scene;
