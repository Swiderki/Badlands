import { getDeltaTime } from "@/src/util/delta-time";
import GameTimeline from "../game-logic/game-timeline";

export interface TimedEffect {
  canBeOverrided: boolean;
  startTimestamp: number;
  duration: number;
  update(deltaTime: number): void;
  finish(): void;
}

type EffectType = "boost" | "slip" | "damaged" | "nitro"; // | "slow" | "freeze" // TODO: Implement other effects

/** This is a class managing time effect like a weaker grip after driving into banana peel, boost after collecting a boost-star etc. */
export default class TimedEffectDriver {
  // private static _instance: TimedEffectDriver;
  private _effects: Map<EffectType, TimedEffect> = new Map();

  // constructor() {
  //   TimedEffectDriver._instance = this;
  // }

  // static get currentInstance(): TimedEffectDriver | null {
  //   if (!TimedEffectDriver._instance) {
  //     return null;
  //   }
  //   return TimedEffectDriver._instance;
  // }

  update() {
    this._effects.forEach((effect, type) => {
      effect.update(getDeltaTime());
      if (GameTimeline.now() > effect.startTimestamp + effect.duration) {
        effect.finish();
        this.cancelEffect(type);
      }
    });
  }

  addEffect(type: EffectType, effect: TimedEffect) {
    if (this._effects.has(type)) {
      if (!this._effects.get(type)!.canBeOverrided) {
        return;
      }
      this._effects.get(type)!.finish();
    }
    this._effects.set(type, effect);
  }

  cancelEffect(type: EffectType) {
    this._effects.delete(type);
  }

  finishEffect(type: EffectType) {
    const effect = this._effects.get(type);
    if (!effect) {
      console.warn(`Trying to finish effect which is not present on the player (${type})`);
    }
    effect?.finish();
    this.cancelEffect(type);
  }

  hasEffect(type: EffectType): boolean {
    return this._effects.has(type);
  }

  get effects() {
    return this._effects.size;
  }
}
