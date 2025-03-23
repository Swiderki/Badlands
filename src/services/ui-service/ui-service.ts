import { Scoreboard } from "../scoreboard/scoreboard";

export class UIService {
  private static instance: UIService;

  //* Speed meter related stuff
  private speedMeterRef: HTMLElement | null;
  private _accTipRef: HTMLElement | null = null;
  private _speedTipRef: HTMLElement | null = null;
  private _scoreboardRef: HTMLElement | null = null;
  private _scoreboardTotalTimeRef: HTMLElement | null = null;
  private _scoreboardListRef: HTMLElement | null = null;

  lapCount: number = 3;

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

  private get nitroIndicator(): HTMLElement {
    const nitroIndicator = document.querySelector<HTMLElement>("#nitro-indicator");
    if (!nitroIndicator) {
      throw new Error("cannot find element for nitro indicator");
    }
    return nitroIndicator;
  }

  private createLapHTML(num: number): HTMLLIElement {
    const lapHTML = document.createElement("li");
    lapHTML.id = `lap-${num}`;
    lapHTML.innerHTML = `Lap ${num}  <span class="highlight">00:00</span>`;
    return lapHTML;
  }

  generateScoreboard() {
    if (!this._scoreboardRef || !this._scoreboardListRef) {
      throw new Error("Scoreboard not initialized");
    }
    this._scoreboardListRef.innerHTML = "";

    for (let i = 1; i <= this.lapCount; i++) {
      this._scoreboardListRef.appendChild(this.createLapHTML(i));
    }
  }
  private constructor() {
    this.speedMeterRef = document.querySelector(".speed-meter__inner");
    this._scoreboardRef = document.querySelector(".scoreboard__wrapper");
    this._scoreboardListRef = document.querySelector(".scoreboard__wrapper ul");
    this._scoreboardTotalTimeRef = document.querySelector(".scoreboard__wrapper h3 .highlight");
    this.setAccMeterValue(0);
    this.setSpeedMeterValue(0);
  }

  public static getInstance(): UIService {
    if (!UIService.instance) {
      UIService.instance = new UIService();
    }

    return UIService.instance;
  }

  //* Time is passed in ms
  setCurrentTime(time: number) {
    if (!this._scoreboardTotalTimeRef) {
      throw new Error("Scoreboard not initialized");
    }
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    const currentTime = `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
    this._scoreboardTotalTimeRef.innerHTML = currentTime;
  }

  setCurrentLapTime(time: number) {
    if (!this._scoreboardListRef) {
      throw new Error("Scoreboard not initialized");
    }
    if (Scoreboard.instance.currentLap === this.lapCount) return;
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    const currentTime = `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
    console.log(Scoreboard.instance.currentLap);
    this._scoreboardListRef.querySelector(`#lap-${Scoreboard.instance.currentLap + 1} span`)!.innerHTML =
      currentTime;
  }

  setAccMeterValue(value: number) {
    this.accTipRef.style.setProperty("--acc-rotation", `${value}deg`);
  }

  setSpeedMeterValue(value: number) {
    this.speedTipRef.style.setProperty("--speed-rotation", `${value.toPrecision(2)}deg`);
  }

  setIsNitroIndicatorActive(active: boolean) {
    this.nitroIndicator.style.setProperty("--current-sprite", active ? "0" : "1");
  }
}
