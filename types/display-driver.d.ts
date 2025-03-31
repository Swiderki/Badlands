import { Vec2D } from "./maths-driver";
export type Sprite = {
  image: HTMLImageElement; // The actual image element
  config: SpriteConfig; // Configuration for sprite-specific parameters
};

export type SpriteConfig = {
  spriteWidth: number; // Width of a single frame in the sprite sheet
  spriteHeight: number; // Height of a single frame in the sprite sheet
};

export type SpriteData = {
  name: string;
  src: string;
  config: SpriteConfig;
};

export type DisplayData = {
  sprite: Sprite;
  position: Vec2D;
  currentSprite: number;
};

export type DrawCall = () => void;

export type SpriteArray = number[][];

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type TracePoint = { position: Vec2D; timestamp: number; alpha?: number };
