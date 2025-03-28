import GameScene from "@/src/scenes/game-scene";
import Game from "../game";

export class Scoreboard {
  static _instance: Scoreboard | null = null;
  private currentPlayerStartTime: Date | null = null;
  private lapTimeList: (Date | null)[] = [null, null, null];
  playerResults: { nickname: string; time: number }[] = [];
  _currentLap: number = 0;
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
    document.querySelector(`#lap-${this._currentLap + 1}`)?.classList.remove("current");
    document.querySelector(`#lap-${lap + 1}`)?.classList.add("current");
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

  update(gameScene: GameScene) {
    const { playerController, track, opponentControllersList, UiService } = gameScene;
    if (!playerController || !track || !track.checkPointPath) {
      return;
    }
    const distanceToNextCheckpoint = track.checkPointPath.getDistanceToPoint(
      playerController.centerPosition,
      this.currentCheckpoint
    );

    if (
      (distanceToNextCheckpoint < 30 &&
        this.currentCheckpoint !== track.checkPointPath.sampledPoints.length) ||
      (distanceToNextCheckpoint < 2 &&
        this.currentCheckpoint === track.checkPointPath.sampledPoints.length) ||
      isNaN(distanceToNextCheckpoint)
    ) {
      this.currentCheckpoint++;
    }

    UiService.setCurrentTime(this.currentTime);
    UiService.setCurrentLapTime(this.currentLapTime);

    if (this.currentCheckpoint === track.checkPointPath.sampledPoints.length) {
      this.currentLap++;
      this.currentCheckpoint = 1;
    }

    if (this.currentLap === UiService.lapCount) {
      if (playerController.finished) return;
      const nickname = Game.instance.nickname;

      Scoreboard.instance.playerResults.push({ nickname: nickname, time: this.currentTime });
      playerController.finished = true;
      playerController.finishedTime = this.currentTime;
      UiService.showSkipButton();

      if (playerController.finished && opponentControllersList.every((opponent) => opponent.finished)) {
        Game.instance.startResultScene();
      }
    }
  }
}
