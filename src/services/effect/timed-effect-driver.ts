import { getDeltaTime } from "@/src/util/delta-time";

export interface TimedEffect {
  startTimestamp: number;
  duration: number;
  update(deltaTime: number): void;
  finish(): void;
}

type EffectType = "boost" | "slip" | "damaged"; // | "slow" | "freeze" // TODO: Implement other effects

/** This is a class managing time effect like a weaker grip after driving into banana peel, boost after collecting a boost-star etc. */
export default class TimedEffectDriver {
  private static _instance: TimedEffectDriver;
  private _effects: Map<EffectType, TimedEffect> = new Map();

  constructor() {
    TimedEffectDriver._instance = this;
  }

  static get currentInstance(): TimedEffectDriver | null {
    if (!TimedEffectDriver._instance) {
      return null;
    }
    return TimedEffectDriver._instance;
  }

  update() {
    this._effects.forEach((effect, type) => {
      effect.update(getDeltaTime());
      if (effect.startTimestamp + effect.duration < Date.now()) {
        effect.finish();
        this.cancelEffect(type);
      }
    });
  }

  addEffect(type: EffectType, effect: TimedEffect) {
    if (this._effects.has(type)) {
      this._effects.get(type)?.finish();
    }
    this._effects.set(type, effect);
  }

  cancelEffect(type: EffectType) {
    this._effects.delete(type);
  }

  hasEffect(type: EffectType): boolean {
    return this._effects.has(type);
  }

  get effects() {
    return this._effects.size;
  }
}
