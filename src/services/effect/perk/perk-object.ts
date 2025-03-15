import EffectObject from "../effect-object";
import { EffectSprites } from "@/src/util/effects-utils";
import { Vec2D } from "@/types/physics";

export default class PerkObject extends EffectObject {
  constructor(position: Vec2D, sprite: EffectSprites) {
    super(position, sprite);
  }

  /** This method should be overriden in GameScene allowing it to remove perk after it has been used since perks are dynamic, single-use objects */
  _onEnter(): void {}

  override _update(isNowColliding: boolean): void {
    if (isNowColliding && !this.isColliding) {
      this._onEnter();
    }
    super._update(isNowColliding);
  }
}
