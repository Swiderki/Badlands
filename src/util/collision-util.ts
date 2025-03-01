import { Vec2D } from "@/types/physics";

export function getCarCorners(position: Vec2D, width: number, height: number, angle: number): Vec2D[] {
  const radianAngle = (angle * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const cosA = Math.cos(radianAngle);
  const sinA = Math.sin(radianAngle);

  //* Center the position of the car
  //* So here we have a problem with out center point of the car
  //* We need to add some offset to the position of the car
  //* That's why we have +9 and +5
  //* It's probably worth investigating why we need this offset
  const cx = position.x + halfHeight + 30;
  const cy = position.y + halfWidth + 15;
  return [
    {
      //* Front Left
      x: cx + (-halfWidth * cosA - -halfHeight * sinA),
      y: cy + (-halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Front Right
      x: cx + (halfWidth * cosA - -halfHeight * sinA),
      y: cy + (halfWidth * sinA + -halfHeight * cosA),
    },
    {
      //* Rear Left
      x: cx + (-halfWidth * cosA - halfHeight * sinA),
      y: cy + (-halfWidth * sinA + halfHeight * cosA),
    },
    {
      //* Rear Right
      x: cx + (halfWidth * cosA - halfHeight * sinA),
      y: cy + (halfWidth * sinA + halfHeight * cosA),
    },
  ];
}
