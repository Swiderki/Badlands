import { Sprite } from "@/types/display-driver";
import { StartPosition } from "@/types/track-driver";
import BonusBase from "../../bonus/bonus-base";
import Track from "../track-driver";
import { TrackPath } from "../track-path";
import DisplayDriver from "../../display-driver/display-driver";

export default class GrassTrack extends Track {
  constructor(
    bonuses: BonusBase[],
    traction: number,
    startPositions: StartPosition[],
    fgLayers: Array<Sprite | null>,
    bgLayers: Array<Sprite | null>,
    baseColliderImage: number[][],
    openedShortcutColliderImage: number[][] | null,
    checkPointPath: TrackPath
  ) {
    super(
      bonuses,
      traction,
      startPositions,
      fgLayers,
      bgLayers,
      baseColliderImage,
      openedShortcutColliderImage,
      checkPointPath
    );

    // const gate = document.createElement("div");
    // gate.id = "gate";
    // gate.style.height = "5px";
    // gate.style.background = "red";
    // gate.style.position = "fixed";
    // gate.style.top = "50px";
    // gate.style.left = "50px";
    // document.body.append(gate);
  }

  override update() {
    super.update();
    // const gate = document.getElementById("gate")!;
    if (this.areShortcutsOpened) {
      if (this.currentTransitionFraction) {
        const displayDriver = DisplayDriver.currentInstance!;
        displayDriver.addDrawCall(() =>
          displayDriver.ctx.rect(100, 300, 30 - this.currentTransitionFraction * 30, 10)
        );
        // gate.style.width = 30 - this.currentTransitionFraction * 30 + "px";
      }
    } else {
      if (this.currentTransitionFraction) {
        const displayDriver = DisplayDriver.currentInstance!;
        displayDriver.addDrawCall(() =>
          displayDriver.ctx.rect(100, 300, this.currentTransitionFraction * 30, 10)
        ); // gate.style.width = this.currentTransitionFraction * 30 + "px";
      }
    }
  }
}
