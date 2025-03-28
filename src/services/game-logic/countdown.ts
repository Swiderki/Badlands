import Game from "../game";

export const startGameWithCountdown = () => {
  const game = Game.getInstance();
  game.pauseGame(true);

  const elements = {
    countdownDialog: document.querySelector<HTMLElement>("#countdown-scene"),
    countdown: document.querySelector<HTMLElement>(".countdown"),
    text: document.querySelector<HTMLElement>(".countdown_text"),
    speedMeter: document.querySelector<HTMLElement>(".speed-meter__inner"),
  };

  if (!elements.countdown || !elements.text || !elements.countdownDialog || !elements.speedMeter) {
    throw new Error("Countdown scene not initialized");
  }

  const updateCountdown = (value: string, message: string, soundPath: string, callback?: () => void) => {
    if (!elements.countdown || !elements.text) return;

    elements.countdown.innerHTML = value;
    elements.text.innerHTML = message;

    const audio = new Audio(soundPath);
    audio.play();

    if (callback) setTimeout(callback, 1000);
  };

  if (elements.countdownDialog) elements.countdownDialog.style.display = "block";
  if (elements.speedMeter) elements.speedMeter.style.display = "none";

  updateCountdown("3", "GET READY!", "/assets/sounds/3.wav", () => {
    updateCountdown("2", "START YOUR ENGINES!", "/assets/sounds/2.wav", () => {
      updateCountdown("1", "GO!", "/assets/sounds/1.wav", () => {
        const startAudio = new Audio("/assets/sounds/start.wav");
        startAudio.play();

        if (elements.countdownDialog) elements.countdownDialog.style.display = "none";
        if (elements.speedMeter) elements.speedMeter.style.display = "block";

        game.resumeGame();
      });
    });
  });
};
