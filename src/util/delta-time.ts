import Game from "../services/game";

export function getDeltaTime() {
  try {
    const dt = Game.getInstance().deltaTime;
    return dt;
  } catch (e) {
    console.error(e);
    return 0;
  }
}
