import BananaPeelObstacle from "../services/effect/obstacle/banana-peel-obstacle";
import BoostPerk from "../services/effect/perk/boost-perk";
import EffectObject from "../services/effect/effect-object";
import OilSpillObstacle from "../services/effect/obstacle/oil-spill-obstacle";
import PotholeObstacle from "../services/effect/obstacle/pothole-obstacle";
import PuddleObstacle from "../services/effect/obstacle/puddle-obstacle";
import SpikesObstacle from "../services/effect/obstacle/spikes-obstacle";
import Track from "../services/track-driver/track-driver";
import { Vec2D } from "@/types/physics";
import WrenchPerk from "../services/effect/perk/wrench-perk";
import InvisiblePerk from "../services/effect/perk/invisible-perk";
import NoCollisionPerk from "../services/effect/perk/no-collision-perk";
import IceObstacle from "../services/effect/obstacle/ice-obstacle";
import IceCubeObstacle from "../services/effect/obstacle/ice-cube-obstacle";
import GravelObstacle from "../services/effect/obstacle/gravel-obstacle";
export enum Obstacles {
  POTHOLE = "pothole",
  PUDDLE = "puddle",
  BANANA_PEEL = "banana_peel",
  SPIKES = "spikes",
  OIL_SPILL = "oil_spill",
  ICE = "ice",
  GRAVEL = "gravel",
}

export enum Perks {
  BOOST_STAR = "boost_star",
  WRENCH = "wrench",
  ICE_CUBE = "ice_cube",
  INVISIBLE = "invisible",
  NO_COLLISION = "no_collision",
}

export type EffectSprites = Obstacles | Perks;

export const getEffectObjectByName = (name: EffectSprites) => {
  switch (name) {
    // obstacles
    case Obstacles.POTHOLE:
      return PotholeObstacle;
    case Obstacles.PUDDLE:
      return PuddleObstacle;
    case Obstacles.BANANA_PEEL:
      return BananaPeelObstacle;
    case Obstacles.SPIKES:
      return SpikesObstacle;
    case Obstacles.OIL_SPILL:
      return OilSpillObstacle;
    case Obstacles.ICE:
      return IceObstacle;
    case Obstacles.GRAVEL:
      return GravelObstacle;

    // perks
    case Perks.BOOST_STAR:
      return BoostPerk;
    case Perks.WRENCH:
      return WrenchPerk;
    case Perks.INVISIBLE:
      return InvisiblePerk;
    case Perks.ICE_CUBE:
      return IceCubeObstacle;
    case Perks.NO_COLLISION:
      return NoCollisionPerk;
    default:
      throw new Error("effect not found");
  }
};

export const getRandomObstacleSprite = (): Obstacles => {
  const effects = Object.values(Obstacles);
  return effects[Math.floor(Math.random() * (effects.length - 2))];
  //* -2 because we don't want to spawn the ice and gravel obstacles
};

export const getRandomPerkSprite = (): Perks => {
  const effects = Object.values(Perks);
  return effects[Math.floor(Math.random() * effects.length)];
};

export const getRandomPosition = (currentObstacles: EffectObject[]): Vec2D => {
  const sampledPoints = Track.currentInstance?.checkPointPath?.sampledPoints;
  if (!sampledPoints) {
    throw new Error("cannot generate objects when track is not loaded");
  }
  const nonCollidingPoints = sampledPoints.filter(({ point }) =>
    currentObstacles.every((obstacle) => {
      const distanceBetweenPointAndObstacle = Math.hypot(
        obstacle.position.x - point.x,
        obstacle.position.y - point.y
      );
      const minimumSpaceBetween =
        Math.max(obstacle.sprite.config.spriteHeight, obstacle.sprite.config.spriteWidth) * 2;
      return distanceBetweenPointAndObstacle > minimumSpaceBetween;
    })
  );
  //  TODO bład tutaj
  return nonCollidingPoints[Math.floor(Math.random() * nonCollidingPoints.length)].point;
};

export const getRandomObstacles = (n: number, currentEffectObjects: EffectObject[]): EffectObject[] => {
  const addedObstacles: EffectObject[] = [];
  for (let i = 0; i < n; i++) {
    const position = getRandomPosition(currentEffectObjects.concat(addedObstacles));
    const sprite = getRandomObstacleSprite();

    const RandomEffectObject = getEffectObjectByName(sprite);
    addedObstacles.push(new RandomEffectObject(position));
  }
  return addedObstacles;
};

export const getRandomPerks = (n: number, currentEffectObjects: EffectObject[]): EffectObject[] => {
  const addedPerks: EffectObject[] = [];
  for (let i = 0; i < n; i++) {
    const position = getRandomPosition(currentEffectObjects.concat(addedPerks));
    const sprite = getRandomPerkSprite();
    console.log("sprite", sprite);
    const RandomEffectObject = getEffectObjectByName(sprite);
    addedPerks.push(new RandomEffectObject(position) as EffectObject); //* "as" is used because switch statement already filters this as PerkObject
  }
  return addedPerks;
};
