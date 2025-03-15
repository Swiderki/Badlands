import BananaPeelObstacle from "../services/effect/obstacle/banana-peel-obstacle";
import BoostPerk from "../services/effect/perk/boost-perk";
import EffectObject from "../services/effect/effect-object";
import PotholeObstacle from "../services/effect/obstacle/pothole-obstacle";
import PuddleObstacle from "../services/effect/obstacle/puddle-obstacle";
import Track from "../services/track-driver/track-driver";
import { Vec2D } from "@/types/physics";

export enum Obstacles {
  POTHOLE = "pothole",
  PUDDLE = "puddle",
  BANANA_PEEL = "banana_peel",
}

export enum Perks {
  BOOST_STAR = "boost_star",
}

export type EffectSprites = Obstacles | Perks;

const getEffectObjectByName = (name: EffectSprites): typeof PotholeObstacle => {
  switch (name) {
    case Obstacles.POTHOLE:
      return PotholeObstacle;
    case Obstacles.PUDDLE:
      return PuddleObstacle;
    case Obstacles.BANANA_PEEL:
      return BananaPeelObstacle;
    case Perks.BOOST_STAR:
      return BoostPerk;
    default:
      throw new Error("effect not found");
  }
};

const getRandomObstacleSprite = (): EffectSprites => {
  const effects = Object.values(Obstacles);
  return effects[Math.floor(Math.random() * effects.length)];
};

// TODO: check if position is on track
const getRandomPosition = (): Vec2D => {
  const sampledPoints = Track.currentInstance?.checkPointPath?.sampledPoints;
  if (!sampledPoints) {
    throw new Error("cannot generate objects when track is not loaded");
  }
  return sampledPoints[Math.floor(Math.random() * sampledPoints.length)].point;
};

export const getRandomObstacle = (n: number): EffectObject[] => {
  return [...Array(n)].map(() => {
    const position = getRandomPosition();
    const sprite = getRandomObstacleSprite();
    const RandomEffectObject = getEffectObjectByName(sprite);
    return new RandomEffectObject(position);
  });
};
