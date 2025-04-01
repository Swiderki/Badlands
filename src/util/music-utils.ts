export const startMusicWithFade = (music: HTMLAudioElement) => {
  if (music.paused) {
    // Only perform transition if music is not already playing
    music.volume = 0; // Start with zero volume
    music.play().catch((err) => console.error("Failed to play audio:", err));

    // Gradually increase volume
    const fadeInInterval = setInterval(() => {
      if (music.volume < 1) {
        music.volume = Math.min(music.volume + 0.1, 1);
      } else {
        clearInterval(fadeInInterval);
      }
    }, 200);
  }
};
