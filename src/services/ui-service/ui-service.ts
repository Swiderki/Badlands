export class UIService {
  private static instance: UIService;

  //* Speed meter related stuff
  private speedMeterRef: HTMLElement | null;
  private _accTipRef: HTMLElement | null = null;
  private _speedTipRef: HTMLElement | null = null;

  private get accTipRef(): HTMLElement {
    if (!this.speedMeterRef) {
      throw new Error("Speed meter not initialized");
    }
    if (!this._accTipRef) {
      this._accTipRef = document.createElement("div");
      this._accTipRef.classList.add("acc-tip");
      this.speedMeterRef.appendChild(this._accTipRef);
    }

    return this._accTipRef;
  }

  private get speedTipRef(): HTMLElement {
    if (!this.speedMeterRef) {
      throw new Error("Speed meter not initialized");
    }
    if (!this._speedTipRef) {
      this._speedTipRef = document.createElement("div");
      this._speedTipRef.classList.add("speed-tip");
      this.speedMeterRef.appendChild(this._speedTipRef);
    }

    return this._speedTipRef;
  }

  private constructor() {
    this.speedMeterRef = document.querySelector(".speed-meter__inner");
    this.setAccMeterValue(0);
    this.setSpeedMeterValue(0);
  }

  public static getInstance(): UIService {
    if (!UIService.instance) {
      UIService.instance = new UIService();
    }

    return UIService.instance;
  }

  setAccMeterValue(value: number) {
    this.accTipRef.style.setProperty("--acc-rotation", `${value}deg`);
  }

  setSpeedMeterValue(value: number) {
    console.log(`Setting speed meter value to ${value}`);
    this.speedTipRef.style.setProperty("--speed-rotation", `${value.toPrecision(2)}deg`);
  }
}
