import Game from "../services/game";

export function getDeltaTime() {
  try {
    const dt = Game.getInstance().deltaTime;
    return dt;
    // jeżeli ktoś naprawi tą funkcje to niech w physics-based-controller zamieni w funkcji rotate linijki
  } catch (e) {
    console.error(e);
    return 0;
  }
}
