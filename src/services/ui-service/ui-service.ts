export class UIService {
  private static instance: UIService;

  //* Speed meter related stuff
  private speedMeterRef: HTMLElement | null;
  private _accTipRef: HTMLElement | null = null;
  private _speedTipRef: HTMLElement | null = null;

  private get accTipRef(): HTMLElement {
    if (!this._accTipRef) {
      this._accTipRef = document.createElement("div");
      this._accTipRef.classList.add("acc-tip");
    }

    return this._accTipRef;
  }

  private get speedTipRef(): HTMLElement {
    if (!this._speedTipRef) {
      this._speedTipRef = document.createElement("div");
      this._speedTipRef.classList.add("speed-tip");
    }

    return this._speedTipRef;
  }

  private constructor() {
    this.speedMeterRef = document.getElementById("speed-meter_wrapper");
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
    this.accTipRef.style.rotate = `${value}deg`;
  }

  setSpeedMeterValue(value: number) {
    this.speedTipRef.style.rotate = `${value}deg`;
  }
}
