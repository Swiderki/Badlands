export function mapPixelToCollisionType(r: number, g: number, b: number, a: number): number {
  if (a === 0) return 0; // Transparent pixel = no collision
  if (r === 255 && g === 0 && b === 0) return 1; // Red = Wall
  if (r === 0 && g === 255 && b === 0) return 2; // Green = Grass
  if (r === 0 && g === 0 && b === 255) return 3; // Blue = Water
  return 4; // Default collision
}
