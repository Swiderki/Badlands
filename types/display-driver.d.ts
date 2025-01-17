type Sprite = {
  image: HTMLImageElement; // The actual image element
  config: SpriteConfig; // Configuration for sprite-specific parameters
};

type SpriteConfig = {
  spriteWidth: number; // Width of a single frame in the sprite sheet
  spriteHeight: number; // Height of a single frame in the sprite sheet
};

type SpriteData = {
  name: string;
  src: string;
  config: SpriteConfig;
};

type DisplayData = {
  sprite: Sprite;
  position: Vec2D;
  currentSprite: number;
};
