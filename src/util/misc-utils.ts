export function mapPixelToCollisionType(r: number, g: number, b: number, a: number): number {
  if (a === 0) return 0; // Transparent pixel = no collision
  if (r > g && r > b) return 1; // Red = Wall
  if (g > r && g > b) return 2; // Green = Grass
  if (b > g && b > r) return 3; // Blue = Water
  return 4; // Default collision
}
