import BananaPeelObstacle from "../services/effect/obstacle/banana-peel-obstacle";
import BoostPerk from "../services/effect/perk/boost-perk";
import EffectObject from "../services/effect/effect-object";
import PerkObject from "../services/effect/perk/perk-object";
import PotholeObstacle from "../services/effect/obstacle/pothole-obstacle";
import PuddleObstacle from "../services/effect/obstacle/puddle-obstacle";
import SpikesObstacle from "../services/effect/obstacle/spikes-obstacle";
import Track from "../services/track-driver/track-driver";
import OilSpillObstacle from "../services/effect/obstacle/oil-spill-obstacle";
import { Vec2D } from "@/types/physics";

export enum Obstacles {
  POTHOLE = "pothole",
  PUDDLE = "puddle",
  BANANA_PEEL = "banana_peel",
  SPIKES = "spikes",
  OIL_SPILL = "oil_spill",
}

export enum Perks {
  BOOST_STAR = "boost_star",
}

export type EffectSprites = Obstacles | Perks;

const getEffectObjectByName = (name: EffectSprites) => {
  switch (name) {
    case Obstacles.POTHOLE:
      return PotholeObstacle;
    case Obstacles.PUDDLE:
      return PuddleObstacle;
    case Obstacles.BANANA_PEEL:
      return BananaPeelObstacle;
    case Perks.BOOST_STAR:
      return BoostPerk;
    case Obstacles.SPIKES:
      return SpikesObstacle;
    case Obstacles.OIL_SPILL:
      return OilSpillObstacle;
    default:
      throw new Error("effect not found");
  }
};

const getRandomObstacleSprite = (): Obstacles => {
  const effects = Object.values(Obstacles);
  return effects[Math.floor(Math.random() * effects.length)];
};

const getRandomPerkSprite = (): Perks => {
  const effects = Object.values(Perks);
  return effects[Math.floor(Math.random() * effects.length)];
};

const getRandomPosition = (): Vec2D => {
  const sampledPoints = Track.currentInstance?.checkPointPath?.sampledPoints;
  if (!sampledPoints) {
    throw new Error("cannot generate objects when track is not loaded");
  }
  return sampledPoints[Math.floor(Math.random() * sampledPoints.length)].point;
};

export const getRandomObstacles = (n: number): EffectObject[] => {
  return [...Array(n)].map(() => {
    const position = getRandomPosition();
    const sprite = getRandomObstacleSprite();
    const RandomEffectObject = getEffectObjectByName(sprite);
    return new RandomEffectObject(position);
  });
};

export const getRandomPerks = (n: number): PerkObject[] => {
  return [...Array(n)].map(() => {
    const position = getRandomPosition();
    const sprite = getRandomPerkSprite();
    const RandomEffectObject = getEffectObjectByName(sprite);
    return new RandomEffectObject(position) as PerkObject; //* "as" is used because switch statement already filters this as PerkObject
  });
};
