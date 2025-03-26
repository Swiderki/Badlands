const getPauseOverlay = () => {
  const pauseOverlay = document.querySelector<HTMLElement>("#game-pause-overlay");
  if (!pauseOverlay) {
    throw new Error("cannot find pause overlay");
  }
  return pauseOverlay;
};

export const htmlShowPauseOverlay = () => {
  const pauseOverlay = getPauseOverlay();
  pauseOverlay.style.display = "flex";
};

export const htmlHidePauseOverlay = () => {
  const pauseOverlay = getPauseOverlay();
  pauseOverlay.style.display = "none";
};
