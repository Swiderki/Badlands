class SpriteLoader {
  private sprites: Map<string, Sprite> = new Map();

  async loadSprite(name: string, src: string, config: SpriteConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = location.origin + src;
      img.onload = () => {
        this.sprites.set(name, { image: img, config });
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    });
  }

  getSprite(name: string): Sprite | null {
    return this.sprites.get(name) || null;
  }
}

export { SpriteLoader };
