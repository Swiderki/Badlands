export class Scoreboard {
  static _instance: Scoreboard | null = null;
  private currentPlayerStartTime: Date | null = null;
  private lapTimeList: (Date | null)[] = [];
  currentLap: number = 0;
  currentCheckpoint: number = 0;

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

  get currentLapTime(): number {
    const now = new Date();
    const lastLapTime = this.lapTimeList[this.currentLap] === null ? this.lapTimeList[this.currentLap] : now;
    if (!lastLapTime) {
      this.lapTimeList[this.currentLap] = now;
      return 0;
    }

    return now.getTime() - lastLapTime.getTime();
  }
}
