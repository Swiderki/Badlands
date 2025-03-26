interface Timeout {
  startTimestamp: number;
  delay: number;
  cb: () => void;
}

/**
 * Game Timeline provides a way to measure time differences using timestamp approach.
 * Its `now()` method return how many milliseconds have gone since the game had been started
 * with one key difference - it follows all the pauses and other possible game states
 */
export default class GameTimeline {
  private static currentTime = 0;
  private static timeouts: Timeout[] = [];

  static now() {
    return GameTimeline.currentTime;
  }

  static update(deltaTime: number) {
    GameTimeline.currentTime += deltaTime * 1000;

    this.timeouts.forEach((timeout, i) => {
      if (GameTimeline.now() > timeout.startTimestamp + timeout.delay) {
        timeout.cb();
        delete this.timeouts[i];
      }
    });
  }

  static setTimeout(cb: () => void, delay: number) {
    GameTimeline.timeouts.push({
      cb,
      delay,
      startTimestamp: GameTimeline.now(),
    });
  }
}
