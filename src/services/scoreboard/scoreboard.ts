export class Scoreboard {
  static _instance: Scoreboard | null = null;
  private currentPlayerStartTime: Date | null = null;
  private lapTimeList: (Date | null)[] = [null, null, null];
  playerResults: { nickname: string; time: number }[] = [];
  _currentLap: number = 1;
  currentCheckpoint: number = 1;

  static get instance(): Scoreboard {
    if (!Scoreboard._instance) {
      Scoreboard._instance = new Scoreboard();
    }

    return Scoreboard._instance;
  }

  get currentTime(): number {
    const now = new Date();
    if (!this.currentPlayerStartTime) {
      this.currentPlayerStartTime = now;
    }
    return now.getTime() - this.currentPlayerStartTime.getTime();
  }

  resetCurrentTime() {
    this.currentPlayerStartTime = new Date();
    this.lapTimeList = [null, null, null];
  }

  get currentLap(): number {
    return this._currentLap;
  }

  set currentLap(lap: number) {
    document.querySelector(`#lap-${this._currentLap}`)?.classList.remove("current");
    document.querySelector(`#lap-${lap}`)?.classList.add("current");
    this._currentLap = lap;
  }

  get currentLapTime(): number {
    const now = new Date();
    let lastLapTime = this.lapTimeList[this.currentLap - 1];

    if (!lastLapTime) {
      lastLapTime = now;
      this.lapTimeList[this.currentLap - 1] = lastLapTime;
    }

    return now.getTime() - lastLapTime.getTime();
  }
}
