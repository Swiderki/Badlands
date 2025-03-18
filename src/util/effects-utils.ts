import BananaPeelObstacle from "../services/effect/obstacle/banana-peel-obstacle";
import BoostPerk from "../services/effect/perk/boost-perk";
import EffectObject from "../services/effect/effect-object";
import PerkObject from "../services/effect/perk/perk-object";
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

const getRandomPosition = (currentObstacles: EffectObject[]): Vec2D => {
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
  console.log("aaaa", sampledPoints.length, nonCollidingPoints.length);
  console.log(nonCollidingPoints);
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

export const getRandomPerks = (n: number, currentEffectObjects: EffectObject[]): PerkObject[] => {
  const addedPerks: PerkObject[] = [];
  for (let i = 0; i < n; i++) {
    const position = getRandomPosition(currentEffectObjects.concat(addedPerks));
    const sprite = getRandomPerkSprite();
    const RandomEffectObject = getEffectObjectByName(sprite);
    addedPerks.push(new RandomEffectObject(position) as PerkObject); //* "as" is used because switch statement already filters this as PerkObject
  }
  return addedPerks;
};
